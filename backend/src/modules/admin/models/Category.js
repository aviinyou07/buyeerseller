const { pool } = require("../config/database");

let subcategoryColumnsCache = null;

async function getSubcategoryColumns(connection = pool) {
  if (!subcategoryColumnsCache) {
    const [cols] = await connection.query("SHOW COLUMNS FROM subcategories");
    subcategoryColumnsCache = new Set(cols.map((col) => col.Field));
  }
  return subcategoryColumnsCache;
}

async function getSubcategoryImageSelect(alias = "sub") {
  const columns = await getSubcategoryColumns();
  return columns.has("image_thumbnail")
    ? `${alias}.image, ${alias}.image_thumbnail`
    : `${alias}.image, ${alias}.image AS image_thumbnail`;
}

class Category {
  static async findAll() {
    const imageSelect = await getSubcategoryImageSelect("sub");
    const [rows] = await pool.query(
      `SELECT c.id, c.parent_id, c.name, c.slug, c.is_active, cat.accent, cat.description, ${imageSelect}
       FROM admin_categories c
       LEFT JOIN categories cat ON cat.id = c.id
       LEFT JOIN subcategories sub ON sub.id = c.id
       ORDER BY c.name ASC`,
    );
    return rows;
  }

  static async count({ search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM admin_categories WHERE ? IS NULL OR name LIKE ?",
      [searchQuery, searchQuery],
    );
    return rows[0].count;
  }

  static async findPaginated({ search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const imageSelect = await getSubcategoryImageSelect("sub");
    const [rows] = await pool.query(
      `SELECT c.id, c.parent_id, c.name, c.slug, c.is_active, p.name AS parent_name, f.id AS form_id, f.title AS form_title,
              cat.accent, cat.description, ${imageSelect}
       FROM admin_categories c
       LEFT JOIN admin_categories p ON c.parent_id = p.id
       LEFT JOIN forms f ON f.category_id = c.id
       LEFT JOIN categories cat ON cat.id = c.id
       LEFT JOIN subcategories sub ON sub.id = c.id
       WHERE (? IS NULL OR c.name LIKE ?)
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`,
      [searchQuery, searchQuery, parseInt(limit, 10), parseInt(offset, 10)],
    );
    return rows;
  }

  static async getSubcategoryCounts() {
    const [rows] = await pool.query(
      "SELECT parent_id, COUNT(*) AS count FROM admin_categories WHERE parent_id IS NOT NULL GROUP BY parent_id",
    );
    return rows;
  }

  static async findBySlug(slug) {
    const [rows] = await pool.query(
      "SELECT id FROM admin_categories WHERE slug = ? LIMIT 1",
      [slug],
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const imageSelect = await getSubcategoryImageSelect("sub");
    const [rows] = await pool.query(
      `SELECT c.*, cat.accent, cat.description, ${imageSelect}
       FROM admin_categories c
       LEFT JOIN categories cat ON cat.id = c.id
       LEFT JOIN subcategories sub ON sub.id = c.id
       WHERE c.id = ? LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  static async create({ parent_id, name, slug, accent, image, image_thumbnail, description }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert into admin_categories
      const [adminResult] = await connection.query(
        "INSERT INTO admin_categories (parent_id, name, slug, is_active) VALUES (?, ?, ?, 1)",
        [parent_id || null, name, slug],
      );
      const insertedId = adminResult.insertId;

      // 2. Synchronize with user app categories / subcategories tables
      if (!parent_id) {
        // Top-level Category
        await connection.query(
          `INSERT INTO categories (id, slug, title, title_key, description, description_key, accent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
  insertedId,
  slug,
  name,
  null,
  description || null,
  null,
  accent || 'blue'
],
        );
      } else {
        // Subcategory
        const subcategoryColumns = await getSubcategoryColumns(connection);
        if (subcategoryColumns.has("image_thumbnail")) {
          await connection.query(
            `INSERT INTO subcategories (id, category_id, slug, name, image, image_thumbnail, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [insertedId, parent_id, slug, name, image || "", image_thumbnail || image || ""],
          );
        } else {
          await connection.query(
            `INSERT INTO subcategories (id, category_id, slug, name, image, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [insertedId, parent_id, slug, name, image || ""],
          );
        }
      }

      await connection.commit();
      return insertedId;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async update(id, { name, slug, parent_id, is_active, accent, image, image_thumbnail, description }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update admin_categories
      await connection.query(
        "UPDATE admin_categories SET name = ?, slug = ?, parent_id = ?, is_active = ? WHERE id = ?",
        [name, slug, parent_id, is_active, id],
      );

      // 2. Update user app tables
      if (!parent_id) {
        // Top-level Category
        // Check if it exists in categories, insert if missing (due to legacy data), else update
        const [existing] = await connection.query(
          "SELECT id FROM categories WHERE id = ?",
          [id],
        );
        if (existing.length > 0) {
          await connection.query(
            `
  UPDATE categories
  SET
    title = ?,
    title_key = ?,
    description = ?,
    slug = ?,
    accent = ?
  WHERE id = ?
  `,
            [name, null, description || null, slug, accent || "blue", id],
          );
        } else {
          await connection.query(
            `INSERT INTO categories (id, slug, title, title_key, description, description_key, accent, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
  id,
  slug,
  name,
  null,
  description || null,
  null,
  accent || 'blue'
],
          );
        }
      } else {
        // Subcategory
        const subcategoryColumns = await getSubcategoryColumns(connection);
        const [existing] = await connection.query(
          "SELECT id FROM subcategories WHERE id = ?",
          [id],
        );
        if (existing.length > 0) {
          if (subcategoryColumns.has("image_thumbnail")) {
            await connection.query(
              "UPDATE subcategories SET name = ?, slug = ?, image = ?, image_thumbnail = ?, category_id = ? WHERE id = ?",
              [name, slug, image || "", image_thumbnail || image || "", parent_id, id],
            );
          } else {
            await connection.query(
              "UPDATE subcategories SET name = ?, slug = ?, image = ?, category_id = ? WHERE id = ?",
              [name, slug, image || "", parent_id, id],
            );
          }
        } else {
          if (subcategoryColumns.has("image_thumbnail")) {
            await connection.query(
              `INSERT INTO subcategories (id, category_id, slug, name, image, image_thumbnail, created_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
              [id, parent_id, slug, name, image || "", image_thumbnail || image || ""],
            );
          } else {
            await connection.query(
              `INSERT INTO subcategories (id, category_id, slug, name, image, created_at)
               VALUES (?, ?, ?, ?, ?, NOW())`,
              [id, parent_id, slug, name, image || ""],
            );
          }
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async countSubcategories(parentId) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM admin_categories WHERE parent_id = ?",
      [parentId],
    );
    return rows[0].count;
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete from user app tables
      await connection.query("DELETE FROM categories WHERE id = ?", [id]);
      await connection.query("DELETE FROM subcategories WHERE id = ?", [id]);

      // Delete from admin_categories
      await connection.query("DELETE FROM admin_categories WHERE id = ?", [id]);

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async toggleStatus(id, nextActive) {
    await pool.query("UPDATE admin_categories SET is_active = ? WHERE id = ?", [
      nextActive,
      id,
    ]);
  }
}

module.exports = Category;
