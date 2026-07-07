const { pool } = require('../config/database');

class AdminAuditLog {
  static async create({ admin_id, action, entity_type, entity_id, created_at }) {
    const [result] = await pool.query(
      'INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, ?, ?)',
      [admin_id, action, entity_type, entity_id, created_at || new Date()]
    );
    return result.insertId;
  }

  static async count({ entity_type, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM admin_audit_logs
       WHERE (? IS NULL OR entity_type = ?)
         AND (? IS NULL OR action LIKE ?)`,
      [entity_type || null, entity_type || null, searchQuery, searchQuery]
    );
    return rows[0].count;
  }

  static async findPaginated({ entity_type, search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, al.admin_id,
              u.full_name AS admin_name, u.phone AS admin_phone, u.role AS admin_role
       FROM admin_audit_logs al
       LEFT JOIN users u ON al.admin_id = u.id
       WHERE (? IS NULL OR al.entity_type = ?)
         AND (? IS NULL OR al.action LIKE ?)
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [entity_type || null, entity_type || null, searchQuery, searchQuery, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }
}

module.exports = AdminAuditLog;
