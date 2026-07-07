const { pool } = require("../config/database");
const { success, error, paginate } = require("../utils/response.utils");
const { logAdminAction } = require("../middlewares/audit.middleware");

// ─── helpers ─────────────────────────────────────────────────────────────────

function coerceInt(val) {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? null : n;
}
function coerceFloat(val) {
  const n = parseFloat(val);
  return Number.isNaN(n) ? null : n;
}
function coerceBool(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (val === "true" || val === "1") return 1;
  return 0;
}
function sanitize(val) {
  return val === "" ? null : val;
}

// Build image photo objects from request
function extractImages(req, raw) {
  const images = [];
  if (req.files && req.files.image && req.files.image[0]) {
    images.push({
      url: `/uploads/listings/${req.files.image[0].filename}`,
      is_primary: 1,
    });
  } else if (raw.image && !raw.image.includes("unsplash.com")) {
    images.push({ url: raw.image, is_primary: 1 });
  }

  if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
    req.files.thumbnail.slice(0, 4).forEach((file) => {
      images.push({ url: `/uploads/listings/${file.filename}`, is_primary: 0 });
    });
  } else if (raw.thumbnail && !raw.thumbnail.includes("unsplash.com")) {
    images.push({ url: raw.thumbnail, is_primary: 0 });
  }

  return images;
}

// ─── listListings ─────────────────────────────────────────────────────────────
const listListings = async (req, res) => {
  const {
    search,
    category_id,
    subcategory_id,
    seller_id,
    status,
    is_featured,
    limit = 10,
    page = 1,
  } = req.query;

  const pageNum = Math.max(1, coerceInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, coerceInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(
      "(p.title LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)",
    );
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (category_id) {
    conditions.push("cat.id = ?");
    params.push(coerceInt(category_id));
  }
  if (subcategory_id) {
    conditions.push("sub.id = ?");
    params.push(coerceInt(subcategory_id));
  }
  if (seller_id) {
    conditions.push("p.seller_id = ?");
    params.push(coerceInt(seller_id));
  }
  if (status) {
    // map frontend status strings → listings.status values
    const statusMap = {
      approved: "active",
      active: "active",
      pending: "pending",
      rejected: "rejected",
      inactive: "inactive",
    };
    const mapped = statusMap[status] || status;
    conditions.push("p.status = ?");
    params.push(mapped);
  }
  if (is_featured === "true") {
    conditions.push("p.is_featured = 1");
  }
  if (is_featured === "false") {
    conditions.push("p.is_featured = 0");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM listings p
       LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
       LEFT JOIN categories cat    ON cat.id = sub.category_id
       LEFT JOIN users u           ON u.id   = p.seller_id
       ${where}`,
      params,
    );

    const [rows] = await pool.query(
      `SELECT
         p.id, p.title, p.description, p.price, p.status AS listing_status,
         p.brand, p.location, p.condition, p.used_for,
         p.offer_badge, p.warranty, p.is_featured,
         (SELECT COALESCE(l.views_count, 0) FROM listings l WHERE l.id = p.id) AS views_count,
         (SELECT COUNT(*) FROM listing_likes ll WHERE ll.listing_id = p.id) AS likes_count,
         (SELECT COUNT(*) FROM listing_reviews lr WHERE lr.listing_id = p.id) AS reviews_count,
         (SELECT COALESCE(AVG(lr.rating), 0) FROM listing_reviews lr WHERE lr.listing_id = p.id) AS average_rating,
         (SELECT COUNT(*) FROM listing_likes ll WHERE ll.listing_id = p.id) AS interested_count,
         p.created_at,
         cat.id   AS category_id,
         cat.title AS category_name,
         sub.id   AS subcategory_id,
         sub.name AS subcategory_name,
         u.id     AS seller_id,
         u.name   AS seller_name,
         u.phone  AS seller_phone,
         (SELECT image_url FROM listing_images ph
          WHERE ph.listing_id = p.id AND ph.is_primary = 1 LIMIT 1) AS main_image_url,
         (SELECT image_url FROM listing_images ph
          WHERE ph.listing_id = p.id AND ph.is_primary = 0 LIMIT 1) AS thumb_image_url,
         (SELECT COUNT(*) FROM listing_images ph WHERE ph.listing_id = p.id) AS image_count
       FROM listings p
       LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
       LEFT JOIN categories cat    ON cat.id = sub.category_id
       LEFT JOIN users u           ON u.id   = p.seller_id
       ${where}
       ORDER BY p.is_featured DESC, p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset],
    );

    const items = rows.map((l) => {
      const mainUrl = l.main_image_url || null;
      const thumbUrl = l.thumb_image_url || mainUrl || null;
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        price: parseFloat(l.price || 0),
        listing_status:
          l.listing_status === "active" ? "approved" : l.listing_status,
        brand: l.brand,
        location: l.location,
        condition: l.condition,
        used_for: l.used_for,
        offer_badge: l.offer_badge,
        warranty: l.warranty,
        quantity: 1,
        shipping_available: false,
        is_featured: l.is_featured === 1 || l.is_featured === true,
        views_count: Number(l.views_count || 0),
        likes_count: Number(l.likes_count || 0),
        reviews_count: Number(l.reviews_count || 0),
        average_rating: Number(l.average_rating || 0),
        interested_count: Number(l.interested_count || 0),
        created_at: l.created_at,
        category_id: l.category_id,
        category_name: l.category_name,
        subcategory_id: l.subcategory_id,
        subcategory_name: l.subcategory_name,
        // shapes expected by AllListings.jsx
        category: { id: l.category_id, name: l.category_name },
        seller: {
          id: l.seller_id,
          business_name: null,
          user: { full_name: l.seller_name, phone: l.seller_phone },
        },
        main_image: mainUrl ? { id: null, url: mainUrl } : null,
        thumbnails: thumbUrl ? [{ id: null, url: thumbUrl }] : [],
        image_count: parseInt(l.image_count || 0, 10),
      };
    });

    return paginate(
      res,
      "Listings retrieved successfully",
      items,
      pageNum,
      limitNum,
      parseInt(total, 10),
    );
  } catch (err) {
    console.error("List Listings error:", err);
    return error(res, "An error occurred fetching listings", 500);
  }
};

const listInterestedUsers = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT
         ll.id,
         ll.user_id AS buyer_id,
         COALESCE(NULLIF(TRIM(u.full_name), ''), NULLIF(TRIM(u.name), ''), 'Buyer') AS name,
         u.email,
         u.phone,
         'Liked this product' AS message,
         'liked' AS status,
         NULL AS created_at
       FROM listing_likes ll
       LEFT JOIN users u ON u.id = ll.user_id
       WHERE ll.listing_id = ?
       ORDER BY ll.id DESC`,
      [id],
    );

    return success(res, "Interested users retrieved successfully", rows);
  } catch (err) {
    console.error("List Interested Users error:", err);
    return error(res, "An error occurred fetching interested users", 500);
  }
};

// ─── getListingDetails ────────────────────────────────────────────────────────
const getListingDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
         cat.id   AS category_id,   cat.title AS category_name,
         sub.id   AS subcategory_id, sub.name  AS subcategory_name,
         u.id     AS user_id,        u.name    AS seller_name,
         u.phone  AS seller_phone
       FROM listings p
       LEFT JOIN subcategories sub ON sub.id = p.subcategory_id
       LEFT JOIN categories cat    ON cat.id = sub.category_id
       LEFT JOIN users u           ON u.id   = p.seller_id
       WHERE p.id = ? LIMIT 1`,
      [id],
    );
    if (!rows[0]) return error(res, "Listing not found", 404);
    const p = rows[0];

    const [photos] = await pool.query(
      "SELECT id, image_url, is_primary FROM listing_images WHERE listing_id = ? ORDER BY is_primary DESC, id",
      [id],
    );

    let parsedMeta = {};
    try {
      parsedMeta = typeof p.meta === 'string' ? JSON.parse(p.meta) : (p.meta || {});
    } catch(e) {}

    const customAttributes = Array.isArray(parsedMeta) ? parsedMeta : (parsedMeta.overviewFields || parsedMeta.customAttributes || parsedMeta.custom_fields || []);
    
    const getMetaValue = (key) => {
      if (Array.isArray(customAttributes)) {
        const item = customAttributes.find(a => a.label?.toLowerCase() === key.toLowerCase());
        return item ? item.value : null;
      }
      return parsedMeta[key] || null;
    };

    const condition = p.condition || getMetaValue('Condition');
    const warranty = p.warranty || getMetaValue('Warranty');
    const used_for = p.used_for || p.usedFor || getMetaValue('Used For');

    const details = {
      id: p.id,
      title: p.title,
      description: p.description,
      price: parseFloat(p.price || 0),
      quantity: p.quantity,
      listing_status: p.status === "active" ? "approved" : p.status,
      is_featured: p.is_featured === 1,
      created_at: p.created_at,
      condition,
      warranty,
      used_for,
      meta: parsedMeta,
      category: { id: p.category_id, name: p.category_name },
      seller: {
        id: p.seller_id,
        business_name: null,
        user: {
          id: p.user_id,
          full_name: p.seller_name,
          phone: p.seller_phone,
        },
      },
      images: photos.map((ph) => ({
        id: ph.id,
        image_url: ph.image_url,
        is_thumbnail: ph.is_primary ? 0 : 1,
      })),
      stats: {
        views: 0,
        likes: 0,
        comments_count: 0,
        reviews_count: 0,
        reports_count: 0,
        avg_rating: "0.0",
      },
    };

    return success(res, "Listing details retrieved", details);
  } catch (err) {
    console.error("Get Listing Details error:", err);
    return error(res, "An error occurred retrieving listing details", 500);
  }
};

// ─── createListing ────────────────────────────────────────────────────────────
const createListing = async (req, res) => {
  const raw = { ...req.body };
  if (!raw.title || !raw.seller_id)
    return error(res, "Please provide title and seller_id", 400);

  // map listing_status (approved/pending/rejected/inactive) → listings.status (active/pending/rejected/inactive)
  const statusMap = {
    approved: "active",
    active: "active",
    pending: "pending",
    rejected: "rejected",
    inactive: "inactive",
  };
  const listingstatus = statusMap[raw.listing_status] || "active";

  const images = extractImages(req, raw);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO listings
         (seller_id,category_id, subcategory_id, title, brand, description, price,
          location, status, \`condition\`, used_for, offer_badge, warranty,
          is_featured, created_at)
       VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        coerceInt(raw.seller_id),
        sanitize(raw.category_id) ? coerceInt(raw.category_id) : null,
        sanitize(raw.subcategory_id) ? coerceInt(raw.subcategory_id) : null,
        raw.title.trim(),
        sanitize(raw.brand),
        sanitize(raw.description),
        coerceFloat(raw.price) || 0,
        sanitize(raw.location),
        listingstatus,
        sanitize(raw.condition),
        sanitize(raw.used_for),
        sanitize(raw.offer_badge),
        sanitize(raw.warranty),
        0,
      ],
    );
    const productId = result.insertId;

    if (images.length > 0) {
      const photoValues = images.map((img) => [
        productId,
        img.url,
        img.is_primary,
      ]);
      await connection.query(
        "INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES ?",
        [photoValues],
      );
    }

    await connection.commit();

    await logAdminAction(
      req.user.id,
      `Created listing: '${raw.title}'`,
      "Listing",
      productId,
    );
    return success(res, "Listing created successfully", { id: productId });
  } catch (err) {
    await connection.rollback();
    console.error("Create Listing error:", err);
    return error(res, "An error occurred creating listing", 500);
  } finally {
    connection.release();
  }
};

// ─── updateListing ────────────────────────────────────────────────────────────
const updateListing = async (req, res) => {
  const { id } = req.params;
  const raw = { ...req.body };

  // check product exists
  const [existing] = await pool.query(
    "SELECT id, title FROM listings WHERE id = ? LIMIT 1",
    [id],
  );
  if (!existing[0]) return error(res, "Listing not found", 404);

  const statusMap = {
    approved: "active",
    active: "active",
    pending: "pending",
    rejected: "rejected",
    inactive: "inactive",
  };
  const listingstatus = raw.listing_status
    ? statusMap[raw.listing_status] || raw.listing_status
    : undefined;

  const images = extractImages(req, raw);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Build dynamic SET clause only for provided fields
    const sets = [];
    const vals = [];
    const map = {
      title: raw.title,
      brand: sanitize(raw.brand),
      description: sanitize(raw.description),
      price: raw.price != null ? coerceFloat(raw.price) : undefined,
      location: sanitize(raw.location),
      status: listingstatus,
      condition: sanitize(raw.condition),
      used_for: sanitize(raw.used_for),
      offer_badge: sanitize(raw.offer_badge),
      warranty: sanitize(raw.warranty),
      subcategory_id:
        raw.subcategory_id != null ? coerceInt(raw.subcategory_id) : undefined,
    };
    for (const [k, v] of Object.entries(map)) {
      if (v !== undefined) {
        sets.push(`\`${k}\` = ?`);
        vals.push(v);
      }
    }

    if (sets.length > 0) {
      await connection.query(
        `UPDATE listings SET ${sets.join(", ")} WHERE id = ?`,
        [...vals, id],
      );
    }

    // Replace photos if new ones are provided
    if (images.length > 0) {
      await connection.query(
        "DELETE FROM listing_images WHERE listing_id = ?",
        [id],
      );
      const photoValues = images.map((img) => [id, img.url, img.is_primary]);
      await connection.query(
        "INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES ?",
        [photoValues],
      );
    }

    await connection.commit();

    await logAdminAction(
      req.user.id,
      `Updated listing: '${raw.title || existing[0].title}'`,
      "Listing",
      id,
    );
    return success(res, "Listing updated successfully", { id });
  } catch (err) {
    await connection.rollback();
    console.error("Update Listing error:", err);
    return error(res, "An error occurred updating listing", 500);
  } finally {
    connection.release();
  }
};

// ─── deleteListing ────────────────────────────────────────────────────────────
const deleteListing = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT id, title FROM listings WHERE id = ? LIMIT 1",
      [id],
    );
    if (!rows[0]) return error(res, "Listing not found", 404);

    await pool.query("DELETE FROM listing_images WHERE listing_id = ?", [id]);
    await pool.query("DELETE FROM listings WHERE id = ?", [id]);

    await logAdminAction(
      req.user.id,
      `Deleted listing: '${rows[0].title}'`,
      "Listing",
      id,
    );
    return success(res, "Listing deleted successfully");
  } catch (err) {
    console.error("Delete Listing error:", err);
    return error(res, "An error occurred deleting listing", 500);
  }
};

// ─── toggleFeatureListing ──────────────────────────────────────────────────────
const toggleFeatureListing = async (req, res) => {
  const { id } = req.params;
  const { is_featured } = req.body;
  if (is_featured === undefined)
    return error(res, "Please provide is_featured parameter (true/false)", 400);

  try {
    const [rows] = await pool.query(
      "SELECT id, title FROM listings WHERE id = ? LIMIT 1",
      [id],
    );
    if (!rows[0]) return error(res, "Listing not found", 404);

    const val =
      is_featured === true || is_featured === "true" || is_featured === 1
        ? 1
        : 0;
    await pool.query("UPDATE listings SET is_featured = ? WHERE id = ?", [
      val,
      id,
    ]);

    const actionText = val ? "Featured" : "Removed Featured tag from";
    await logAdminAction(
      req.user.id,
      `${actionText} listing: '${rows[0].title}'`,
      "Listing",
      id,
    );
    return success(
      res,
      `Listing successfully ${val ? "featured" : "unfeatured"}`,
      { id, is_featured: val },
    );
  } catch (err) {
    console.error("Toggle Feature error:", err);
    return error(res, "An error occurred updating featured status", 500);
  }
};

module.exports = {
  createListing,
  listListings,
  listInterestedUsers,
  getListingDetails,
  deleteListing,
  toggleFeatureListing,
  updateListing,
};
