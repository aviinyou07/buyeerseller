const { pool } = require('../config/database');

class ListingImage {
  static async findByListing(listingId) {
    const [rows] = await pool.query('SELECT id, image_url, is_thumbnail FROM listing_images WHERE listing_id = ? ORDER BY is_thumbnail ASC, id ASC', [listingId]);
    return rows;
  }

  static async findByListings(listingIds) {
    if (listingIds.length === 0) return [];
    const [rows] = await pool.query('SELECT id, listing_id, image_url, is_thumbnail FROM listing_images WHERE listing_id IN (?) ORDER BY is_thumbnail ASC, id ASC', [listingIds]);
    return rows;
  }
}

module.exports = ListingImage;
