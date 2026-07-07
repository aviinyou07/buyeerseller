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
