import pool from '../../db.js';
import { ensureEngagementTables } from '../listing-engagement/listingEngagement.queries.js';

function generateSlug(text = '') {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 200);
}

function parseMeta(meta) {
  if (!meta) return {};
  if (typeof meta === 'object') return meta;

  try {
    return JSON.parse(meta);
  } catch {
    return {};
  }
}

let productPhotoColumnsCache = null;
let listingImageColumnsCache = null;

async function getColumnSet(tableName, connection = pool) {
  const [cols] = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  return new Set(cols.map((col) => col.Field));
}

async function getProductPhotoColumns() {
  if (!productPhotoColumnsCache) {
    productPhotoColumnsCache = await getColumnSet('listing_images');
  }
  return productPhotoColumnsCache;
}

async function getListingImageColumns(connection) {
  if (!listingImageColumnsCache) {
    listingImageColumnsCache = await getColumnSet('listing_images', connection);
  }
  return listingImageColumnsCache;
}

// ─── List listings with filters ───────────────────────────────────────────────

/**
 * Fetch listings with optional filters.
 * @param {{ subcategoryId?, categoryId?, sellerId?, search?, location?, status?, page?, limit? }} filters
 */
export async function listlistings({ subcategoryId, categoryId, sellerId, search, location, status, page = 1, limit = 30, userId } = {}) {
  await ensureEngagementTables();
  const photoColumns = await getProductPhotoColumns();
  const hasThumbnailUrl = photoColumns.has('thumbnail_url');
  const thumbnailSelect = hasThumbnailUrl
    ? `COALESCE(
        (SELECT NULLIF(ph.thumbnail_url, '') FROM listing_images ph WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1),
        (SELECT NULLIF(ph.thumbnail_url, '') FROM listing_images ph WHERE ph.listing_id = p.id ORDER BY id LIMIT 1),
        JSON_UNQUOTE(JSON_EXTRACT(p.meta, '$.imageThumbnails[0]')),
        (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1),
        (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id ORDER BY id LIMIT 1)
      )`
    : `JSON_UNQUOTE(JSON_EXTRACT(p.meta, '$.imageThumbnails[0]'))`;

  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  // Join subcategory / category by slug or id
  if (subcategoryId) {
    if (!isNaN(subcategoryId)) {
      conditions.push('sub.id = ?');
      params.push(Number(subcategoryId));
    } else {
      conditions.push('sub.slug = ?');
      params.push(subcategoryId);
    }
  }
  if (categoryId) {
    if (!isNaN(categoryId)) {
      conditions.push('cat.id = ?');
      params.push(Number(categoryId));
    } else {
      conditions.push('cat.slug = ?');
      params.push(categoryId);
    }
  }
  if (sellerId) {
    conditions.push('p.seller_id = ?');
    params.push(sellerId);
  }
  if (search) {
    conditions.push('(p.title LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (location) {
    conditions.push('p.location LIKE ?');
    params.push(`%${location}%`);
  }

  // Status filter
  if (status && status !== 'all') {
    conditions.push('p.status = ?');
    params.push(status);
  } else if (!status) {
    // Default: only show active listings publicly
    conditions.push("p.status = 'active'");
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT
      p.id, p.title, p.brand, p.description, p.price,
      p.location, p.status, p.condition, p.warranty,
      p.used_for, p.offer_badge, p.is_featured, p.created_at,
p.seller_id,
p.meta,
(SELECT COALESCE(l.views_count, 0) FROM listings l WHERE l.id = p.id) AS views_count,
cat.slug  AS category_id,
      cat.title AS category_name,
      sub.slug  AS subcategory_id,
      sub.name  AS subcategory_name,
      u.name    AS seller_name,
      u.phone   AS seller_phone,
      u.rating  AS seller_rating,
      (SELECT COUNT(*) FROM listing_likes ll WHERE ll.listing_id = p.id) AS likes_count,
      (SELECT COUNT(*) FROM listing_reviews lr WHERE lr.listing_id = p.id) AS reviews_count,
      (SELECT AVG(lr.rating) FROM listing_reviews lr WHERE lr.listing_id = p.id) AS avg_rating,
      ${userId
      ? '(SELECT COUNT(*) FROM listing_likes ll WHERE ll.listing_id = p.id AND ll.user_id = ?) AS is_liked,'
      : '0 AS is_liked,'
    }
      COALESCE(
        (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1),
        (SELECT image_url FROM listing_images ph WHERE ph.listing_id = p.id ORDER BY id LIMIT 1)
      ) AS primary_photo,
      ${thumbnailSelect} AS thumbnail_photo
    FROM listings p
    LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
    LEFT JOIN categories cat    ON cat.id = sub.category_id
    LEFT JOIN users u           ON u.id   = p.seller_id
    ${where}
    ORDER BY p.is_featured DESC, p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const listParams = userId ? [userId, ...params, limit, offset] : [...params, limit, offset];
  const [rows] = await pool.query(sql, listParams);

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM listings p
     LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
     LEFT JOIN categories cat    ON cat.id = sub.category_id
     ${where}`,
    params
  );

  return { listings: rows, total, page, limit };
}

// ─── Single product ───────────────────────────────────────────────────────────

/**
 * Fetch one product with all its photos.
 * @param {number} id
 */
export async function getProductById(id) {
  await ensureEngagementTables();
  const photoColumns = await getProductPhotoColumns();
  const photoColumnsSql = photoColumns.has('thumbnail_url')
    ? 'id, image_url, thumbnail_url, is_primary'
    : 'id, image_url, is_primary';

  const [rows] = await pool.query(
    `SELECT
     p.*,
     (SELECT COALESCE(l.views_count, 0) FROM listings l WHERE l.id = p.id) AS views_count,
     cat.slug  AS category_id,
       cat.title AS category_name,
       sub.slug  AS subcategory_id,
       sub.name  AS subcategory_name,
       u.full_name AS seller_name,
       u.phone   AS seller_phone,
       (SELECT AVG(lr.rating) FROM listing_reviews lr JOIN listings l2 ON l2.id = lr.listing_id WHERE l2.seller_id = p.seller_id) AS seller_rating,
       (SELECT COUNT(*) FROM listing_likes ll WHERE ll.listing_id = p.id) AS likes_count,
       (SELECT COUNT(*) FROM listing_reviews lr WHERE lr.listing_id = p.id) AS reviews_count,
       (SELECT AVG(lr.rating) FROM listing_reviews lr WHERE lr.listing_id = p.id) AS avg_rating
     FROM listings p
     LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
     LEFT JOIN categories cat    ON cat.id = sub.category_id
     LEFT JOIN users u           ON u.id   = p.seller_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;

  const [photos] = await pool.query(
    `SELECT ${photoColumnsSql} FROM listing_images WHERE listing_id = ? ORDER BY is_primary DESC, id`,
    [id]
  );

  return { ...rows[0], photos };
}

// ─── Create product ───────────────────────────────────────────────────────────

/**
 * Insert a new product and its photos.
 * @param {object} data
 * @param {string[]} photoUrls
 */
export async function createProduct(data, photoUrls = []) {
  const {
    sellerId, categoryId, subcategoryId, title, brand = null, description = null,
    price, location = null, condition = null, warranty = null,
    usedFor = null, offerBadge = null, isFeatured = 0,
  } = data;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const baseSlug = generateSlug(title) || `listing-${Date.now()}`;
    let slug = baseSlug;
    for (let attempt = 2; attempt < 100; attempt += 1) {
      const [[{ count }]] = await connection.query(
        'SELECT COUNT(*) AS count FROM listings WHERE slug = ?',
        [slug]
      );
      if (count === 0) break;
      slug = `${baseSlug}-${attempt}`;
    }

    // Ensure seller profile exists
    const [[existingProfile]] = await connection.query(
      'SELECT id FROM seller_profiles WHERE user_id = ?',
      [sellerId]
    );

    if (!existingProfile) {
      const [[user]] = await connection.query('SELECT full_name FROM users WHERE id = ?', [sellerId]);
      const businessName = user && user.full_name ? `${user.full_name} Store` : `Seller ${sellerId} Store`;
      await connection.query(
        'INSERT INTO seller_profiles (user_id, business_name, is_verified) VALUES (?, ?, 0)',
        [sellerId, businessName]
      );
    }


    const [result] = await connection.query(
      `INSERT INTO listings (
        seller_id, category_id, subcategory_id, title, slug, brand, description,
        price, location, listing_status, status, \`condition\`, warranty,
        used_for, offer_badge, is_featured, meta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?)`,
      [
        sellerId,
        categoryId,
        subcategoryId,
        title,
        slug,
        brand,
        description,
        price,
        location,
        condition,
        warranty,
        usedFor,
        offerBadge,
        isFeatured,
        JSON.stringify(data.meta || {}),
      ]
    );
    const productId = result.insertId;

    if (photoUrls.length) {
      const imageColumns = await getListingImageColumns(connection);
      const hasThumbnailUrl = imageColumns.has('thumbnail_url');
      const insertColumns = hasThumbnailUrl
        ? 'listing_id, image_url, thumbnail_url, is_primary, is_thumbnail, sort_order'
        : 'listing_id, image_url, is_primary, is_thumbnail, sort_order';
      const photoValues = photoUrls.map((photo, i) => {
        const originalUrl = photo.originalUrl || photo;
        const thumbnailUrl = photo.thumbnailUrl || originalUrl;
        return hasThumbnailUrl
          ? [productId, originalUrl, thumbnailUrl, i === 0 ? 1 : 0, i === 0 ? 1 : 0, i]
          : [productId, originalUrl, i === 0 ? 1 : 0, i === 0 ? 1 : 0, i];
      });
      await connection.query(
        `INSERT INTO listing_images (${insertColumns}) VALUES ?`,
        [photoValues]
      );
    }

    await connection.commit();
    return productId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// ─── Subcategory lookup ───────────────────────────────────────────────────────

/**
 * Get subcategory ID by slug.
 * @param {string} slug
 */
/**
 * Update an existing product/listing and optionally replace its photos.
 * @param {number} id
 * @param {object} data
 * @param {string[]} photoUrls
 */
export async function updateProduct(id, data, photoUrls = []) {
  const {
    sellerId, categoryId, subcategoryId, title, brand = null, description = null,
    price, location = null, condition = null, warranty = null,
    usedFor = null, offerBadge = null,
  } = data;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      'SELECT id, seller_id, meta FROM listings WHERE id = ? LIMIT 1',
      [id]
    );

    if (!existing[0]) {
      await connection.rollback();
      return { status: 'not_found' };
    }

    if (Number(existing[0].seller_id) !== Number(sellerId)) {
      await connection.rollback();
      return { status: 'forbidden' };
    }

    const nextMeta = {
      ...parseMeta(existing[0].meta),
      ...(data.meta || {}),
    };

    await connection.query(
      `UPDATE listings
       SET category_id = ?, subcategory_id = ?, title = ?, brand = ?, description = ?, price = ?,
           location = ?, \`condition\` = ?, warranty = ?, used_for = ?,
           offer_badge = ?, meta = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        categoryId,
        subcategoryId,
        title,
        brand,
        description,
        price,
        location,
        condition,
        warranty,
        usedFor,
        offerBadge,
        JSON.stringify(nextMeta),
        id,
      ]
    );

    if (photoUrls.length) {
      await connection.query('DELETE FROM listing_images WHERE listing_id = ?', [id]);
      const imageColumns = await getListingImageColumns(connection);
      const hasThumbnailUrl = imageColumns.has('thumbnail_url');
      const insertColumns = hasThumbnailUrl
        ? 'listing_id, image_url, thumbnail_url, is_primary, is_thumbnail, sort_order'
        : 'listing_id, image_url, is_primary, is_thumbnail, sort_order';
      const photoValues = photoUrls.map((photo, i) => {
        const originalUrl = photo.originalUrl || photo;
        const thumbnailUrl = photo.thumbnailUrl || originalUrl;
        return hasThumbnailUrl
          ? [id, originalUrl, thumbnailUrl, i === 0 ? 1 : 0, i === 0 ? 1 : 0, i]
          : [id, originalUrl, i === 0 ? 1 : 0, i === 0 ? 1 : 0, i];
      });
      await connection.query(
        `INSERT INTO listing_images (${insertColumns}) VALUES ?`,
        [photoValues]
      );
    }

    await connection.commit();
    return { status: 'updated' };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getSubcategoryBySlug(slug) {
  const [rows] = await pool.query('SELECT id, category_id FROM subcategories WHERE slug = ? LIMIT 1', [slug]);
  return rows[0] || null;
}
