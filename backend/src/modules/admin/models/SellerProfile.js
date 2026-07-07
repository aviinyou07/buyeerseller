const { pool } = require('../config/database');

class SellerProfile {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM seller_profiles WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async count() {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM seller_profiles');
    return rows[0].count;
  }

  static async getSellerMetrics(sellerId) {
    const [[listingsResult], [ordersResult], [revenueResult]] = await Promise.all([
      pool.query('SELECT COUNT(*) AS count FROM listings WHERE seller_id = ?', [sellerId]),
      pool.query('SELECT COUNT(*) AS count FROM orders WHERE seller_id = ?', [sellerId]),
      pool.query("SELECT SUM(total_amount) AS revenue FROM orders WHERE seller_id = ? AND order_status != 'cancelled'", [sellerId])
    ]);
    return {
      totalListings: listingsResult[0] ? listingsResult[0].count : 0,
      totalOrders: ordersResult[0] ? ordersResult[0].count : 0,
      totalRevenue: revenueResult[0] ? parseFloat(revenueResult[0].revenue || 0) : 0
    };
  }

  static async updateVerification(id, isVerified) {
    const val = isVerified ? 1 : 0;
    await pool.query('UPDATE seller_profiles SET is_verified = ? WHERE id = ?', [val, id]);
  }
}

module.exports = SellerProfile;
