const { pool } = require('../config/database');

class ListingApprovalHistory {
  static async findByListing(listingId) {
    const [rows] = await pool.query(
      `SELECT lah.id, lah.action, lah.remarks, lah.created_at, u.full_name AS admin_name
       FROM listing_approval_history lah
       LEFT JOIN users u ON lah.admin_id = u.id
       WHERE lah.listing_id = ?
       ORDER BY lah.created_at DESC`,
      [listingId]
    );
    return rows;
  }
}

module.exports = ListingApprovalHistory;
