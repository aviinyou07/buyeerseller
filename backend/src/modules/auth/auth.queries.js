import pool from '../../db.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const normalizePhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  return phone;
};

// ─── Users ────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  const [rows] = await pool.query(
    `SELECT id, COALESCE(name, full_name) AS name, full_name, phone, email, role,
            COALESCE(status, account_status) AS status, created_at
     FROM users
     WHERE LOWER(email) = ?
     LIMIT 1`,
    [normalizedEmail]
  );

  return rows[0] || null;
}

export async function findUserByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);

  const [rows] = await pool.query(
    `SELECT id, COALESCE(name, full_name) AS name, full_name, phone, email, role,
            COALESCE(status, account_status) AS status, created_at
     FROM users
     WHERE phone = ? OR phone = ?
     LIMIT 1`,
    [phone, normalizedPhone]
  );

  return rows[0] || null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, COALESCE(name, full_name) AS name, full_name, phone, email, role,
            COALESCE(status, account_status) AS status, store_name, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function createUser({ fullName, email, phone, role = 'user' }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  const [result] = await pool.query(
    `INSERT INTO users (
      uuid,
      full_name,
      name,
      phone,
      email,
      role,
      account_status,
      status,
      email_verified,
      created_at,
      updated_at
    )
    VALUES (
      UUID(),
      ?,
      ?,
      ?,
      ?,
      ?,
      'active',
      'active',
      'Yes',
      NOW(),
      NOW()
    )`,
    [fullName, fullName, normalizedPhone, normalizedEmail, role]
  );

  return result.insertId;
}

// ─── OTP Store ────────────────────────────────────────────────────────────────

export async function saveOtp(email, otp, purpose = 'login', expiresInMinutes = 10) {
  const normalizedEmail = normalizeEmail(email);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  await pool.query(
    `INSERT INTO otp_store (email, otp, purpose, expires_at)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       otp = VALUES(otp),
       expires_at = VALUES(expires_at),
       updated_at = NOW()`,
    [normalizedEmail, otp, purpose, expiresAt]
  );
}

export async function findValidOtp(email, otp, purpose = 'login') {
  const normalizedEmail = normalizeEmail(email);

  const [rows] = await pool.query(
    `SELECT *
     FROM otp_store
     WHERE email = ?
       AND otp = ?
       AND purpose = ?
       AND expires_at > NOW()
     LIMIT 1`,
    [normalizedEmail, otp, purpose]
  );

  return rows[0] || null;
}

export async function deleteOtp(email, purpose) {
  const normalizedEmail = normalizeEmail(email);

  if (purpose) {
    await pool.query(
      `DELETE FROM otp_store WHERE email = ? AND purpose = ?`,
      [normalizedEmail, purpose]
    );
    return;
  }

  await pool.query(
    `DELETE FROM otp_store WHERE email = ?`,
    [normalizedEmail]
  );
}