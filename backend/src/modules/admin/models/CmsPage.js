const { pool } = require('../config/database');

class CmsPage {
  static async findAll() {
    const [rows] = await pool.query('SELECT id, title, slug FROM cms_pages ORDER BY title ASC');
    return rows;
  }

  static async findBySlug(slug) {
    const [rows] = await pool.query('SELECT id, title, slug, content FROM cms_pages WHERE slug = ? LIMIT 1', [slug]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, title, slug, content FROM cms_pages WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async create({ title, slug, content }) {
    const [result] = await pool.query('INSERT INTO cms_pages (title, slug, content) VALUES (?, ?, ?)', [title, slug, content]);
    return result.insertId;
  }

  static async update(id, { title, content }) {
    await pool.query('UPDATE cms_pages SET title = ?, content = ? WHERE id = ?', [title, content, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM cms_pages WHERE id = ?', [id]);
  }
}

module.exports = CmsPage;
