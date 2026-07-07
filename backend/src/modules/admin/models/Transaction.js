const { pool } = require('../config/database');

class Transaction {
  static async findByOrder(orderId) {
    const [rows] = await pool.query('SELECT * FROM transactions WHERE order_id = ? LIMIT 1', [orderId]);
    return rows[0] || null;
  }
}

module.exports = Transaction;
