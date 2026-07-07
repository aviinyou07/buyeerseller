const mysql = require('mysql2/promise');
const { pool } = require('../config/database');

class Notification {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT n.id, n.title, n.message, n.is_read, n.user_id, u.full_name, u.phone
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.id DESC LIMIT 100
    `);
    return rows;
  }

  static async createMany(targetUsers, title, message) {
    if (targetUsers.length === 0) return;
    
    const values = targetUsers.map(u => `(${u.id}, ${mysql.escape(title)}, ${mysql.escape(message)}, 0)`).join(', ');
    
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, is_read) 
      VALUES ${values}
    `);
  }

  static async countAll() {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM notifications');
    return rows[0].count;
  }
}

module.exports = Notification;
