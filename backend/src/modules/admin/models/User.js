const { pool } = require("../config/database");

class User {
  static async create({
    full_name,
    phone,
    password_hash,
    role = "user",
    account_status = "active",
    address = null,
  }) {
    const [result] = await pool.query(
      `INSERT INTO users (uuid, full_name, phone, password_hash, role, account_status, address, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [full_name, phone, password_hash, role, account_status, address],
    );

    const insertId = result.insertId;
    if (!insertId) return null;

    return await User.findById(insertId);
  }
  static async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  }

  static async findByPhone(phone) {
    const normalizedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE phone = ? OR phone = ? LIMIT 1",
      [phone, normalizedPhone],
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0] || null;
  }


  static async findCustomers({ type, search, status, limit, offset }) {
    const params = [];
    const countParams = [];

    let countSql = `SELECT COUNT(DISTINCT u.id) AS count FROM users u LEFT JOIN seller_profiles sp ON sp.user_id = u.id `;
    let dataSql = `SELECT u.id, u.uuid, u.full_name, u.phone, u.email, u.role, u.account_status, u.created_at, u.address, 
                   (SELECT 1 FROM orders o WHERE o.buyer_id = u.id LIMIT 1) AS is_buyer_activity,
                   sp.id AS seller_profile_id, sp.business_name, sp.gst_number, sp.is_verified 
                   FROM users u LEFT JOIN seller_profiles sp ON sp.user_id = u.id `;

    const baseWhere = ` WHERE u.role IN ('user', 'seller') AND u.account_status != 'deleted' `;

    if (type === "seller") {
      countSql += baseWhere + ` AND sp.id IS NOT NULL `;
      dataSql += baseWhere + ` AND sp.id IS NOT NULL `;
    } else if (type === "buyer") {
      countSql += baseWhere + ` AND EXISTS (SELECT 1 FROM orders o WHERE o.buyer_id = u.id) `;
      dataSql += baseWhere + ` AND EXISTS (SELECT 1 FROM orders o WHERE o.buyer_id = u.id) `;
    } else {
      countSql += baseWhere;
      dataSql += baseWhere;
    }

    if (status) {
      countSql += ` AND u.account_status = ? `;
      dataSql += ` AND u.account_status = ? `;
      countParams.push(status);
      params.push(status);
    }

    if (search) {
      countSql += ` AND (u.full_name LIKE ? OR u.phone LIKE ?) `;
      dataSql += ` AND (u.full_name LIKE ? OR u.phone LIKE ?) `;
      const searchLike = `%${search}%`;
      countParams.push(searchLike, searchLike);
      params.push(searchLike, searchLike);
    }

    dataSql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ? `;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [countResult] = await pool.query(countSql, countParams);
    const totalItems = countResult[0] ? countResult[0].count : 0;

    const [customers] = await pool.query(dataSql, params);

    return { customers, totalItems };
  }

  static async findProfileById(id) {
    const [rows] = await pool.query(
      `SELECT u.id, u.uuid, u.full_name, u.phone, u.role, u.account_status, u.created_at, u.address, 
              (SELECT 1 FROM orders o WHERE o.buyer_id = u.id LIMIT 1) AS is_buyer_activity,
              sp.id AS seller_profile_id, sp.business_name, sp.gst_number, sp.is_verified 
       FROM users u 
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id 
       WHERE u.id = ? AND u.account_status != 'deleted' 
       LIMIT 1`,
      [id],
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await pool.query("UPDATE users SET account_status = ? WHERE id = ?", [
      status,
      id,
    ]);
  }

  static async softDelete(id) {
    await pool.query(
      "UPDATE users SET account_status = 'deleted' WHERE id = ?",
      [id],
    );
  }

  static async countUsers({ role, status }) {
    let sql = "SELECT COUNT(*) AS count FROM users WHERE 1=1";
    const params = [];
    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }
    if (status) {
      sql += " AND account_status = ?";
      params.push(status);
    }
    const [rows] = await pool.query(sql, params);
    return rows[0].count;
  }

  static async findRecent(limit) {
    const [rows] = await pool.query(
      "SELECT id, uuid, full_name, phone, account_status, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT ?",
      [parseInt(limit, 10)],
    );
    return rows;
  }

  static async getMonthlyGrowth(monthsLimit) {
    const [rows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(id) AS registrations
       FROM users
       WHERE role = 'user' AND created_at >= NOW() - INTERVAL ? MONTH
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`,
      [parseInt(monthsLimit, 10)],
    );
    return rows;
  }

  static async getBuyerMetrics(buyerId) {
    const [[ordersResult], [spentResult]] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM orders WHERE buyer_id = ?", [
        buyerId,
      ]),
      pool.query(
        "SELECT SUM(total_amount) AS spent FROM orders WHERE buyer_id = ? AND order_status != 'cancelled'",
        [buyerId],
      ),
    ]);
    return {
      total_orders_placed: ordersResult[0] ? ordersResult[0].count : 0,
      total_spent: spentResult[0] ? parseFloat(spentResult[0].spent || 0) : 0,
    };
  }

  static async findSellers() {
    const [rows] = await pool.query(
      `SELECT u.id 
       FROM users u 
       INNER JOIN seller_profiles sp ON sp.user_id = u.id`,
    );
    return rows;
  }

  static async findBuyers() {
    const [rows] = await pool.query(
      `SELECT DISTINCT u.id 
       FROM users u 
       INNER JOIN orders o ON o.buyer_id = u.id`,
    );
    return rows;
  }

  static async findActiveUsers() {
    const [rows] = await pool.query(
      `SELECT id FROM users WHERE role = 'user' AND account_status != 'deleted'`,
    );
    return rows;
  }
  static async updateProfile(id, { full_name, email }) {
    await pool.query(
      "UPDATE users SET full_name = ?, email = ?, updated_at = NOW() WHERE id = ?",
      [full_name, email, id]
    );
  }

  static async updatePassword(id, password_hash) {
    await pool.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [password_hash, id]
    );
  }
}

module.exports = User;
