const { pool } = require('../config/database');

class Banner {
  static async findAll() {
    const [rows] = await pool.query('SELECT id, title, image_url FROM banners ORDER BY id DESC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, title, image_url FROM banners WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async create({ title, imageUrl }) {
    const [result] = await pool.query('INSERT INTO banners (title, image_url) VALUES (?, ?)', [title, imageUrl]);
    return result.insertId;
  }

  static async delete(id) {
    await pool.query('DELETE FROM banners WHERE id = ?', [id]);
  }
}

module.exports = Banner;
