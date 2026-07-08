import pool from '../../db.js';

/**
 * Fetch all addresses for a user
 * @param {number} userId
 */
export async function getUserAddresses(userId) {
  const [rows] = await pool.query(
    'SELECT id, title, address_line, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
    [userId]
  );
  return rows;
}

/**
 * Fetch all payment methods for a user
 * @param {number} userId
 */
export async function getUserPaymentMethods(userId) {
  const [rows] = await pool.query(
    'SELECT id, provider, details, is_default FROM user_payment_methods WHERE user_id = ? ORDER BY is_default DESC, id DESC',
    [userId]
  );
  return rows;
}

/**
 * Fetch all bank accounts for a user
 * @param {number} userId
 */
export async function getUserBankAccounts(userId) {
  const [rows] = await pool.query(
    'SELECT id, bank_name, account_details, is_primary FROM user_bank_accounts WHERE user_id = ? ORDER BY is_primary DESC, id DESC',
    [userId]
  );
  return rows;
}

/**
 * Fetch KYC status for a user
 * @param {number} userId
 */
export async function getUserKycStatus(userId) {
  const [rows] = await pool.query(
    'SELECT kyc_aadhaar_verified AS aadhaar, kyc_pan_verified AS pan, kyc_bank_verified AS bank FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  return rows[0] || { aadhaar: 'No', pan: 'No', bank: 'No' };
}

/**
 * Calculate earnings for a seller
 * @param {number} userId
 */
export async function getSellerEarnings(userId) {
  const [[paidRows]] = await pool.query(
    "SELECT SUM(amount) AS total FROM orders WHERE seller_id = ? AND payment_status = 'Paid'",
    [userId]
  );
  const [[unpaidRows]] = await pool.query(
    "SELECT SUM(amount) AS total FROM orders WHERE seller_id = ? AND payment_status = 'Unpaid'",
    [userId]
  );

  const totalEarned = Number(paidRows.total || 0);
  const pendingPayout = Number(unpaidRows.total || 0);
  const platformFee = Number((totalEarned * 0.05).toFixed(2)); // 5% platform fee representation

  return {
    totalEarned,
    pendingPayout,
    platformFee
  };
}

/**
 * Update user details (name, email, phone)
 */
export async function updateUserProfile(userId, { full_name, email, phone }) {
  const [result] = await pool.query(
    'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?',
    [full_name, email, phone, userId]
  );
  return result.affectedRows > 0;
}

/**
 * Update or insert default user address
 */
export async function updateUserAddress(userId, address) {
  // Check if default address exists
  const [existing] = await pool.query(
    'SELECT id FROM user_addresses WHERE user_id = ? AND is_default = 1 LIMIT 1',
    [userId]
  );

  if (existing.length > 0) {
    await pool.query(
      'UPDATE user_addresses SET address_line = ? WHERE id = ?',
      [address, existing[0].id]
    );
  } else {
    // Insert new default address
    await pool.query(
      'INSERT INTO user_addresses (user_id, title, address_line, is_default) VALUES (?, ?, ?, 1)',
      [userId, 'Default Address', address]
    );
  }
}

/**
 * Update seller profile business details
 */
export async function updateSellerProfileByUserId(userId, { business_name, gst_number }) {
  // Find seller profile ID from users
  const [user] = await pool.query('SELECT seller_profile_id FROM users WHERE id = ? LIMIT 1', [userId]);
  if (user.length > 0) {
    if (user[0].seller_profile_id) {
      await pool.query(
        'UPDATE seller_profiles SET business_name = ?, gst_number = ? WHERE id = ?',
        [business_name, gst_number, user[0].seller_profile_id]
      );
    } else if (business_name || gst_number) {
      const [insertResult] = await pool.query(
        'INSERT INTO seller_profiles (user_id, business_name, gst_number, is_verified) VALUES (?, ?, ?, 0)',
        [userId, business_name, gst_number]
      );
      await pool.query(
        'UPDATE users SET seller_profile_id = ? WHERE id = ?',
        [insertResult.insertId, userId]
      );
    }
  }
}
