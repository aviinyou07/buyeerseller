const { pool } = require('../config/database');

class DailyStatistics {
  static async getRecent(limit) {
    const [rows] = await pool.query(
      'SELECT stat_date, total_users, total_orders, total_revenue FROM daily_statistics ORDER BY stat_date DESC LIMIT ?',
      [parseInt(limit, 10)]
    );
    return rows;
  }
}

module.exports = DailyStatistics;
