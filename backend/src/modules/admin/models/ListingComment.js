const { pool } = require('../config/database');

class ListingComment {
  static async count({ listing_id, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM listing_comments lc
       WHERE (? IS NULL OR lc.listing_id = ?)
         AND (? IS NULL OR lc.comment LIKE ?)`,
      [listing_id || null, listing_id || null, searchQuery, searchQuery]
    );
    return rows[0].count;
  }

  static async findPaginated({ listing_id, search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT lc.id, lc.comment, lc.created_at, lc.listing_id, lc.user_id, lc.parent_comment_id,
              u.full_name AS user_name, u.phone AS user_phone, l.title AS listing_title
       FROM listing_comments lc
       LEFT JOIN users u ON lc.user_id = u.id
       LEFT JOIN listings l ON lc.listing_id = l.id
       WHERE (? IS NULL OR lc.listing_id = ?)
         AND (? IS NULL OR lc.comment LIKE ?)
       ORDER BY lc.created_at DESC
       LIMIT ? OFFSET ?`,
      [
        listing_id || null, listing_id || null,
        searchQuery, searchQuery,
        parseInt(limit, 10), parseInt(offset, 10)
      ]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM listing_comments WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async findDetailsById(id) {
    const [rows] = await pool.query(
      `SELECT lc.id, lc.listing_id, u.full_name AS commenter_name 
       FROM listing_comments lc
       LEFT JOIN users u ON lc.user_id = u.id
       WHERE lc.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async delete(id) {
    await pool.query('DELETE FROM listing_comments WHERE id = ?', [id]);
  }

  static async countByListing(listingId) {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM listing_comments WHERE listing_id = ?', [listingId]);
    return rows[0].count;
  }
}

module.exports = ListingComment;
