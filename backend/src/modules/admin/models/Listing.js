const { pool } = require("../config/database");
const { generateSlug } = require("../utils/slug.utils");

class Listing {
  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM listings WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  }

  static async updateWithDetailsTransactional(id, data = {}, images = []) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Inspect table columns to build a safe update
      const [cols] = await connection.query("SHOW COLUMNS FROM listings");
      const colNames = cols.map((c) => c.Field);

      const coreFields = [
        "title",
        "description",
        "price",
        "quantity",
        "listing_status",
        "category_id",
        "subcategory_id",
        "seller_id",
        "is_featured",
        "sku",
        "brand",
        "condition",
        "visibility",
        "expires_at",
        "location",
        "shipping_available",
        "return_policy",
        "warranty",
        "slug",
      ];

      const sets = [];
      const values = [];

      for (const field of coreFields) {
        if (data[field] !== undefined && colNames.includes(field)) {
          if (typeof data[field] === "boolean") {
            sets.push(`\`${field}\` = ?`);
            values.push(data[field] ? 1 : 0);
          } else {
            sets.push(`\`${field}\` = ?`);
            values.push(data[field]);
          }
        }
      }

      // slug uniqueness (if provided)
      if (data.slug && colNames.includes("slug")) {
        let slugVal = data.slug;
        let unique = false;
        let attempt = 0;
        const base = slugVal;
        while (!unique) {
          const [rows] = await connection.query(
            "SELECT COUNT(*) AS count FROM listings WHERE slug = ? AND id != ?",
            [slugVal, id],
          );
          if (rows[0].count === 0) unique = true;
          else {
            attempt += 1;
            slugVal = `${base}-${attempt}`;
          }
        }
        // replace slug value in sets/values if present
        const slugIndex = sets.findIndex((s) => s.startsWith("`slug` =") || s.startsWith("slug ="));
        if (slugIndex !== -1) {
          values[slugIndex] = slugVal;
        } else {
          sets.push("`slug` = ?");
          values.push(slugVal);
        }
      }

      // extras into meta column if present
      const metaColumnCandidates = ["meta", "extras", "listing_meta", "data"];
      const metaColumn = metaColumnCandidates.find((c) => colNames.includes(c));
      const extras = {};
      for (const k of Object.keys(data)) {
        if (coreFields.includes(k)) continue;
        if (colNames.includes(k)) continue;
        extras[k] = data[k];
      }
      if (metaColumn && Object.keys(extras).length > 0) {
        sets.push(`\`${metaColumn}\` = ?`);
        values.push(JSON.stringify(extras));
      }

      // updated_at
      if (colNames.includes("updated_at")) {
        sets.push("`updated_at` = NOW()");
      }

      if (sets.length > 0) {
        const updateSql = `UPDATE listings SET ${sets.join(", ")} WHERE id = ?`;
        values.push(id);
        await connection.query(updateSql, values);
      }

      // handle images: replace existing images with provided images if provided
      if (images && images.length > 0) {
        await connection.query(
          "DELETE FROM listing_images WHERE listing_id = ?",
          [id],
        );
        const [imgCols] = await connection.query(
          "SHOW COLUMNS FROM listing_images",
        );
        const hasThumb = imgCols.some((c) => c.Field === "is_thumbnail");
        const imgValues = images.map((img) => {
          if (typeof img === "string") {
            return hasThumb ? [id, img, 0] : [id, img];
          }
          return hasThumb
            ? [id, img.url || null, img.is_thumbnail ? 1 : 0]
            : [id, img.url || null];
        });
        if (hasThumb) {
          await connection.query(
            "INSERT INTO listing_images (listing_id, image_url, is_thumbnail) VALUES ?",
            [imgValues],
          );
        } else {
          await connection.query(
            "INSERT INTO listing_images (listing_id, image_url) VALUES ?",
            [imgValues],
          );
        }
      }

      await connection.commit();
      const updated = await Listing.findDetailsById(id);
      return updated;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async count({ status, category_id, is_featured, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM listings
       WHERE (? IS NULL OR listing_status = ?)
         AND (? IS NULL OR category_id = ?)
         AND (? IS NULL OR is_featured = ?)
         AND (? IS NULL OR title LIKE ?)`,
      [
        status || null,
        status || null,
        category_id || null,
        category_id || null,
        is_featured !== null ? is_featured : null,
        is_featured !== null ? is_featured : null,
        searchQuery,
        searchQuery,
      ],
    );
    return rows[0].count;
  }

  static async findPaginated({
    status,
    category_id,
    is_featured,
    search,
    limit,
    offset,
  }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT l.id, l.uuid, l.title, l.price, l.quantity, l.listing_status, l.views_count, l.likes_count, l.is_featured, l.created_at,
              l.subcategory_id, l.brand, l.condition, l.used_for, l.offer_badge, l.warranty, l.location, l.shipping_available, l.sale_price, l.sku, l.visibility,
              c.id AS category_id, c.name AS category_name, 
              sc.name AS subcategory_name,
              sp.id AS seller_id, sp.business_name, 
              u.full_name AS seller_name, u.phone AS seller_phone
       FROM listings l
       LEFT JOIN admin_categories c ON l.category_id = c.id
       LEFT JOIN admin_categories sc ON l.subcategory_id = sc.id
       LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
       LEFT JOIN users u ON u.id = l.seller_id
       WHERE (? IS NULL OR l.listing_status = ?)
         AND (? IS NULL OR l.category_id = ?)
         AND (? IS NULL OR l.is_featured = ?)
         AND (? IS NULL OR l.title LIKE ?)
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [
        status || null,
        status || null,
        category_id || null,
        category_id || null,
        is_featured !== null ? is_featured : null,
        is_featured !== null ? is_featured : null,
        searchQuery,
        searchQuery,
        parseInt(limit, 10),
        parseInt(offset, 10),
      ],
    );
    return rows;
  }

  static async findDetailsById(id) {
    const [rows] = await pool.query(
      `SELECT l.id, l.uuid, l.title, l.description, l.price, l.quantity, l.listing_status, l.views_count, l.likes_count, l.expires_at, l.is_featured, l.approved_at, l.created_at,
              l.subcategory_id, l.brand, l.condition, l.used_for, l.offer_badge, l.warranty, l.location, l.shipping_available, l.sale_price, l.sku, l.visibility, l.meta,
              c.id AS category_id, c.name AS category_name,
              sc.name AS subcategory_name,
              sp.id AS seller_id, sp.business_name, sp.gst_number, sp.is_verified,
              u.id AS user_id, u.full_name AS seller_name, u.phone AS seller_phone, u.email AS seller_email
       FROM listings l
       LEFT JOIN admin_categories c ON l.category_id = c.id
       LEFT JOIN admin_categories sc ON l.subcategory_id = sc.id
       LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
       LEFT JOIN users u ON sp.user_id = u.id
       WHERE l.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  static async deleteListingTransactional(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "DELETE FROM listing_images WHERE listing_id = ?",
        [id],
      );
      await connection.query(
        "DELETE FROM listing_attributes WHERE listing_id = ?",
        [id],
      );
      await connection.query(
        "DELETE FROM listing_comments WHERE listing_id = ?",
        [id],
      );
      await connection.query(
        "DELETE FROM listing_reviews WHERE listing_id = ?",
        [id],
      );
      await connection.query(
        "DELETE FROM listing_reports WHERE listing_id = ?",
        [id],
      );
      await connection.query("DELETE FROM listings WHERE id = ?", [id]);
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async toggleFeature(id, is_featured) {
    const val = is_featured ? 1 : 0;
    await pool.query("UPDATE listings SET is_featured = ? WHERE id = ?", [
      val,
      id,
    ]);
  }

  static async moderateListingTransactional(
    id,
    { nextStatus, approvedAt, adminId, historyAction, remarks },
  ) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      const statusMap = {
        pending: 'pending',
        approved: 'active',
        rejected: 'rejected',
        draft: 'draft',
        inactive: 'inactive'
      };
      const publicStatus = statusMap[nextStatus] || 'pending';

      await connection.query(
        "UPDATE listings SET listing_status = ?, status = ?, approved_at = ? WHERE id = ?",
        [nextStatus, publicStatus, approvedAt, id],
      );
      await connection.query(
        `INSERT INTO listing_approval_history (listing_id, admin_id, action, remarks, created_at) 
         VALUES (?, ?, ?, ?, NOW())`,
        [id, adminId, historyAction, remarks],
      );
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async countByStatus(status) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM listings WHERE listing_status = ?",
      [status],
    );
    return rows[0].count;
  }

  static async getRecentPending(limit) {
    const [rows] = await pool.query(
      `SELECT l.id, l.title, l.created_at, c.name AS category_name, sp.business_name, u.full_name AS seller_name, u.phone AS seller_phone
       FROM listings l
       LEFT JOIN admin_categories c ON l.category_id = c.id
       LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
       LEFT JOIN users u ON sp.user_id = u.id
       WHERE l.listing_status = 'pending'
       ORDER BY l.created_at DESC LIMIT ?`,
      [parseInt(limit, 10)],
    );
    return rows;
  }

  static async getCategoryDistribution() {
    const [rows] = await pool.query(
      `SELECT l.category_id, c.name AS categoryName, COUNT(l.id) AS listingsCount
       FROM listings l
       LEFT JOIN admin_categories c ON l.category_id = c.id
       GROUP BY l.category_id, c.name`,
    );
    return rows;
  }

  static async getStatusDistribution() {
    const [rows] = await pool.query(
      `SELECT listing_status, COUNT(id) AS count
       FROM listings
       GROUP BY listing_status`,
    );
    return rows;
  }

  static async createWithDetailsTransactional(
    data = {},
    images = [],
    attributes = [],
  ) {
    // data: arbitrary keys provided by controller. We'll only insert columns that exist
    // in the listings table to remain backward-compatible. Extra/unknown fields will
    // be serialized into a JSON meta column if available (meta|extras|listing_meta).
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Inspect table columns to build a safe insert
      const [cols] = await connection.query("SHOW COLUMNS FROM listings");
      const colNames = cols.map((c) => c.Field);

      // Known core fields we prefer to map to real columns when available
      const coreFields = [
        "title",
        "description",
        "price",
        "quantity",
        "listing_status",
        "category_id",
        "subcategory_id",
        "seller_id",
        "is_featured",
        "sku",
        "brand",
        "condition",
        "visibility",
        "expires_at",
        "location",
        "shipping_available",
        "return_policy",
        "warranty",
        "slug",
      ];

      // Choose a meta column if available
      const metaColumnCandidates = ["meta", "extras", "listing_meta", "data"];
      const metaColumn = metaColumnCandidates.find((c) => colNames.includes(c));

      // Build insert columns dynamically
      const insertCols = ["uuid"];
      const insertPlaceholders = ["UUID()"];
      const insertValues = [];

      for (const field of coreFields) {
        if (data[field] !== undefined && colNames.includes(field)) {
          insertCols.push(field);
          insertPlaceholders.push("?");
          // normalize booleans to 0/1
          if (typeof data[field] === "boolean")
            insertValues.push(data[field] ? 1 : 0);
          else insertValues.push(data[field]);
        }
      }

      // slug generation: if slug column exists, ensure unique slug
      if (colNames.includes("slug")) {
        let slugVal =
          data.slug || (data.title ? generateSlug(data.title) : null);
        if (slugVal) {
          // ensure uniqueness by appending suffix if needed
          let unique = false;
          let attempt = 0;
          const base = slugVal;
          while (!unique) {
            const [rows] = await connection.query(
              "SELECT COUNT(*) AS count FROM listings WHERE slug = ?",
              [slugVal],
            );
            if (rows[0].count === 0) unique = true;
            else {
              attempt += 1;
              slugVal = `${base}-${attempt}`;
            }
          }
          if (!insertCols.includes("slug")) {
            insertCols.push("slug");
            insertPlaceholders.push("?");
            insertValues.push(slugVal);
          }
        }
      }

      // any remaining keys in data that are not part of the known columns will be stored in metaColumn
      const extras = {};
      for (const k of Object.keys(data)) {
        if (k === "slug") continue; // handled
        if (coreFields.includes(k)) continue; // handled above
        if (colNames.includes(k)) continue; // already mapped
        extras[k] = data[k];
      }

      if (metaColumn && Object.keys(extras).length > 0) {
        insertCols.push(metaColumn);
        insertPlaceholders.push("?");
        insertValues.push(JSON.stringify(extras));
      }

      // timestamps
      if (colNames.includes("created_at")) {
        insertCols.push("created_at");
        insertPlaceholders.push("NOW()");
      }
      if (colNames.includes("updated_at")) {
        insertCols.push("updated_at");
        insertPlaceholders.push("NOW()");
      }

      const insertSql = `INSERT INTO listings (${insertCols.map(c => `\`${c}\``).join(", ")}) VALUES (${insertPlaceholders.join(", ")})`;

      const [result] = await connection.query(insertSql, insertValues);

      const listingId = result.insertId;

      if (images && images.length > 0) {
        // Detect whether listing_images has an is_thumbnail column
        const [imgCols] = await connection.query(
          "SHOW COLUMNS FROM listing_images",
        );
        const hasThumb = imgCols.some((c) => c.Field === "is_thumbnail");

        const imgValues = images.map((img) => {
          if (typeof img === "string") {
            return hasThumb ? [listingId, img, 0] : [listingId, img];
          }
          return hasThumb
            ? [listingId, img.url || null, img.is_thumbnail ? 1 : 0]
            : [listingId, img.url || null];
        });

        if (hasThumb) {
          await connection.query(
            "INSERT INTO listing_images (listing_id, image_url, is_thumbnail) VALUES ?",
            [imgValues],
          );
        } else {
          await connection.query(
            "INSERT INTO listing_images (listing_id, image_url) VALUES ?",
            [imgValues],
          );
        }
      }

      await connection.commit();

      const created = await Listing.findDetailsById(listingId);
      return created;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = Listing;
