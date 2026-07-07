const { pool } = require('../config/database');

class OrderItem {
  static async findByOrder(orderId) {
    const [rows] = await pool.query(
      `SELECT oi.id, oi.quantity, oi.price, l.id AS listing_id, l.title AS listing_title, l.price AS listing_price
       FROM order_items oi
       LEFT JOIN listings l ON oi.listing_id = l.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    return rows;
  }
}

module.exports = OrderItem;
