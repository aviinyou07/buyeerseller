const { pool } = require('../config/database');

class GovernmentScheme {
  static async count({ category_id, type, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM government_schemes
       WHERE (? IS NULL OR category_id = ?)
         AND (? IS NULL OR scheme_type = ?)
         AND (? IS NULL OR title LIKE ?)`,
      [category_id || null, category_id || null, type || null, type || null, searchQuery, searchQuery]
    );
    return rows[0].count;
  }

  static async findPaginated({ category_id, type, search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT gs.*, c.name AS category_name
       FROM government_schemes gs
       LEFT JOIN admin_categories c ON gs.category_id = c.id
       WHERE (? IS NULL OR gs.category_id = ?)
         AND (? IS NULL OR gs.scheme_type = ?)
         AND (? IS NULL OR gs.title LIKE ?)
       ORDER BY gs.id DESC
       LIMIT ? OFFSET ?`,
      [category_id || null, category_id || null, type || null, type || null, searchQuery, searchQuery, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  static async findByCategory(catId) {
    const [rows] = await pool.query('SELECT * FROM government_schemes WHERE category_id = ?', [catId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM government_schemes WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async create({ category_id, title, description, eligibility, scheme_type, start_date, end_date }) {
    const [result] = await pool.query(
      `INSERT INTO government_schemes (category_id, title, description, eligibility, scheme_type, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, title, description || null, eligibility || null, scheme_type, start_date || null, end_date || null]
    );
    return result.insertId;
  }

  static async update(id, { category_id, title, description, eligibility, scheme_type, start_date, end_date }) {
    await pool.query(
      `UPDATE government_schemes
       SET category_id = ?, title = ?, description = ?, eligibility = ?, scheme_type = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [category_id, title, description, eligibility, scheme_type, start_date, end_date, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM government_schemes WHERE id = ?', [id]);
  }
}

module.exports = GovernmentScheme;
