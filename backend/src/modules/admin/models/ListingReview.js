const { pool } = require('../config/database');

class ListingReview {
  static async count({ rating, listing_id, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM listing_reviews lr
       WHERE (? IS NULL OR lr.rating = ?)
         AND (? IS NULL OR lr.listing_id = ?)
         AND (? IS NULL OR lr.review LIKE ?)`,
      [rating || null, rating || null, listing_id || null, listing_id || null, searchQuery, searchQuery]
    );
    return rows[0].count;
  }

  static async findPaginated({ rating, listing_id, search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT lr.id, lr.rating, lr.review, lr.created_at, lr.listing_id, lr.user_id,
              u.full_name AS user_name, u.phone AS user_phone, l.title AS listing_title
       FROM listing_reviews lr
       LEFT JOIN users u ON lr.user_id = u.id
       LEFT JOIN listings l ON lr.listing_id = l.id
       WHERE (? IS NULL OR lr.rating = ?)
         AND (? IS NULL OR lr.listing_id = ?)
         AND (? IS NULL OR lr.review LIKE ?)
       ORDER BY lr.created_at DESC
       LIMIT ? OFFSET ?`,
      [
        rating || null, rating || null,
        listing_id || null, listing_id || null,
        searchQuery, searchQuery,
        parseInt(limit, 10), parseInt(offset, 10)
      ]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM listing_reviews WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async findDetailsById(id) {
    const [rows] = await pool.query(
      `SELECT lr.id, lr.listing_id, u.full_name AS reviewer_name 
       FROM listing_reviews lr
       LEFT JOIN users u ON lr.user_id = u.id
       WHERE lr.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async delete(id) {
    await pool.query('DELETE FROM listing_reviews WHERE id = ?', [id]);
  }

  static async getListingStats(listingId) {
    const [rows] = await pool.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(id) AS reviews_count 
       FROM listing_reviews 
       WHERE listing_id = ?`,
      [listingId]
    );
    return {
      avg_rating: rows[0] ? rows[0].avg_rating : 0,
      reviews_count: rows[0] ? rows[0].reviews_count : 0
    };
  }
}

module.exports = ListingReview;
