const { pool } = require('../config/database');

class Order {
  static async count({ status, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM orders
       WHERE (? IS NULL OR order_status = ?)
         AND (? IS NULL OR order_number LIKE ?)`,
      [status || null, status || null, searchQuery, searchQuery]
    );
    return rows[0].count;
  }

  static async findPaginated({ status, search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.created_at,
              u.id AS buyer_id, u.full_name AS buyer_name, u.phone AS buyer_phone,
              sp.id AS seller_id, sp.business_name,
              su.full_name AS seller_name, su.phone AS seller_phone
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       LEFT JOIN seller_profiles sp ON o.seller_id = sp.user_id
       LEFT JOIN users su ON sp.user_id = u.id
       WHERE (? IS NULL OR o.order_status = ?)
         AND (? IS NULL OR o.order_number LIKE ?)
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [status || null, status || null, searchQuery, searchQuery, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async findDetailsById(id) {
    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.created_at,
              u.id AS buyer_id, u.full_name AS buyer_name, u.phone AS buyer_phone, u.account_status AS buyer_status,
              sp.id AS seller_id, sp.business_name, sp.gst_number, sp.is_verified,
              su.id AS seller_user_id, su.full_name AS seller_name, su.phone AS seller_phone,
              t.id AS transaction_db_id, t.transaction_id AS txn_reference, t.payment_status
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       LEFT JOIN seller_profiles sp ON o.seller_id = sp.user_id
       LEFT JOIN users su ON sp.user_id = u.id
       LEFT JOIN transactions t ON t.order_id = o.id
       WHERE o.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [status, id]);
  }

  static async cancel(id) {
    await pool.query("UPDATE orders SET order_status = 'cancelled' WHERE id = ?", [id]);
  }

  static async refundTransactional(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        "UPDATE transactions SET payment_status = 'refunded' WHERE order_id = ?",
        [id]
      );
      await connection.query(
        "UPDATE orders SET order_status = 'cancelled' WHERE id = ?",
        [id]
      );
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  static async countAll() {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM orders');
    return rows[0].count;
  }

  static async countBuyers() {
    const [rows] = await pool.query('SELECT COUNT(DISTINCT buyer_id) AS count FROM orders');
    return rows[0].count;
  }

  static async sumRevenue() {
    const [rows] = await pool.query("SELECT SUM(total_amount) AS revenue FROM orders WHERE order_status != 'cancelled'");
    return parseFloat(rows[0].revenue || 0);
  }

  static async findRecent(limit) {
    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.total_amount, o.order_status, o.created_at, 
              u.full_name AS buyer_name, u.phone AS buyer_phone, sp.business_name AS seller_business
       FROM orders o
       LEFT JOIN users u ON o.buyer_id = u.id
       LEFT JOIN seller_profiles sp ON o.seller_id = sp.user_id
       ORDER BY o.created_at DESC LIMIT ?`,
      [parseInt(limit, 10)]
    );
    return rows;
  }

  static async getMonthlyRevenue(monthsLimit) {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(id) AS total_orders, SUM(total_amount) AS total_revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL ? MONTH
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [parseInt(monthsLimit, 10)]
    );
    return rows;
  }
}

module.exports = Order;
