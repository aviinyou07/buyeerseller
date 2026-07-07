const { pool } = require('../config/database');

class ListingReport {
  static async count({ status, search }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM listing_reports
       WHERE (? IS NULL OR status = ?)
         AND (? IS NULL OR reason LIKE ?)`,
      [status || null, status || null, searchQuery, searchQuery]
    );
    return rows[0].count;
  }

  static async findPaginated({ status, search, limit, offset }) {
    const searchQuery = search ? `%${search}%` : null;
    const [rows] = await pool.query(
      `SELECT r.id, r.reason, r.status, r.reported_by, r.listing_id,
              u.full_name AS reporter_name, u.phone AS reporter_phone,
              l.title AS listing_title, l.price AS listing_price, l.listing_status,
              sp.id AS seller_id, sp.business_name, sp.user_id AS seller_user_id,
              su.full_name AS seller_name, su.phone AS seller_phone
       FROM listing_reports r
       LEFT JOIN users u ON r.reported_by = u.id
       LEFT JOIN listings l ON r.listing_id = l.id
       LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
       LEFT JOIN users su ON sp.user_id = u.id
       WHERE (? IS NULL OR r.status = ?)
         AND (? IS NULL OR r.reason LIKE ?)
       ORDER BY r.id DESC
       LIMIT ? OFFSET ?`,
      [status || null, status || null, searchQuery, searchQuery, parseInt(limit, 10), parseInt(offset, 10)]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM listing_reports WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async findDetailsById(id) {
    const [rows] = await pool.query(
      `SELECT r.id, r.status, r.listing_id, l.seller_id, sp.user_id AS seller_user_id, su.full_name AS seller_name
       FROM listing_reports r
       LEFT JOIN listings l ON r.listing_id = l.id
       LEFT JOIN seller_profiles sp ON l.seller_id = sp.user_id
       LEFT JOIN users su ON sp.user_id = u.id
       WHERE r.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async countByListing(listingId) {
    const [rows] = await pool.query('SELECT COUNT(*) AS count FROM listing_reports WHERE listing_id = ?', [listingId]);
    return rows[0].count;
  }

  static async updateStatus(id, status) {
    await pool.query('UPDATE listing_reports SET status = ? WHERE id = ?', [status, id]);
  }

  static async resolveReportTransactional(id, { actionAgainstSeller, sellerUserId }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Mark report as resolved
      await connection.query(
        "UPDATE listing_reports SET status = 'resolved' WHERE id = ?",
        [id]
      );

      // 2. Perform action on seller if requested
      if (actionAgainstSeller !== 'none' && sellerUserId) {
        if (actionAgainstSeller === 'block') {
          await connection.query(
            "UPDATE users SET account_status = 'blocked' WHERE id = ?",
            [sellerUserId]
          );
        } else if (actionAgainstSeller === 'suspend') {
          await connection.query(
            "UPDATE users SET account_status = 'suspended' WHERE id = ?",
            [sellerUserId]
          );
        }
      }

      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = ListingReport;
