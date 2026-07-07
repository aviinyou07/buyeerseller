import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  createUser,
  saveOtp,
  findValidOtp,
  deleteOtp,
} from './auth.queries.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
  });
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function normalizePhone(phone = '') {
  return String(phone).replace(/\D/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function getMailTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email OTP service is not configured.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendOtpEmail(email, otp, purpose = 'login') {
  const transporter = getMailTransporter();

  const subject =
    purpose === 'register'
      ? 'Verify your BuyerSeller account'
      : 'Your BuyerSeller login OTP';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #111827;">
        <h2 style="margin-bottom: 8px;">BuyerSeller Verification</h2>
        <p>Your OTP is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p style="color: #6b7280; font-size: 13px;">
          If you did not request this OTP, please ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 *
 * Login body:
 * { email, purpose: "login" }
 *
 * Register body:
 * { fullName, email, phone, purpose: "register" }
 */
export async function sendOtp(req, res) {
  try {
    const purpose = req.body.purpose;
    const email = normalizeEmail(req.body.email);
    const fullName = String(req.body.fullName || req.body.name || '').trim();
    const phone = normalizePhone(req.body.phone || '');

    if (!purpose || !['login', 'register'].includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Purpose must be login or register.',
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required.',
      });
    }

    if (purpose === 'login') {
      const existingUser = await findUserByEmail(email);

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'No account found. Please register first.',
        });
      }

      if (existingUser.status && existingUser.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Your account is not active.',
        });
      }
    }

    if (purpose === 'register') {
      if (!fullName) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required.',
        });
      }

      if (!phone || phone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Valid 10-digit phone number is required.',
        });
      }

      const existingEmail = await findUserByEmail(email);

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered. Please login.',
        });
      }

      const existingPhone = await findUserByPhone(phone);

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: 'Phone number already registered. Please login.',
        });
      }
    }

    const otp = generateOtp();

    await saveOtp(email, otp, purpose, 10);
    await sendOtpEmail(email, otp, purpose);

    return res.json({
      success: true,
      message: 'OTP sent successfully on email.',
    });
  } catch (error) {
    console.error('[sendOtp]', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
}

/**
 * POST /api/auth/verify-login
 * Body: { email, otp }
 */
export async function verifyLogin(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required.',
      });
    }

    const validOtp = await findValidOtp(email, otp, 'login');

    if (!validOtp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found. Please register first.',
      });
    }

    await deleteOtp(email, 'login');

    const token = signToken(user.id);

    return res.json({
  success: true,
  token,
  user: {
    id: user.id,
    fullName: user.full_name || user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  },
});
  } catch (error) {
    console.error('[verifyLogin]', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

/**
 * POST /api/auth/verify-register
 * Body: { fullName, email, phone, otp }
 */
export async function verifyRegister(req, res) {
  try {
    const fullName = String(req.body.fullName || req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const phone = normalizePhone(req.body.phone || '');
    const otp = String(req.body.otp || '').trim();

    if (!fullName || !email || !phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone and OTP are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required.',
      });
    }

    if (phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required.',
      });
    }

    const validOtp = await findValidOtp(email, otp, 'register');

    if (!validOtp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP.',
      });
    }

    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered. Please login.',
      });
    }

    const existingPhone = await findUserByPhone(phone);

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered. Please login.',
      });
    }

    const newId = await createUser({
      fullName,
      email,
      phone,
      role: 'user',
    });

    await deleteOtp(email, 'register');

    const user = await findUserById(newId);
    const token = signToken(newId);

    return res.json({
  success: true,
  token,
  user: {
    id: user.id,
    fullName: user.full_name || user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  },
});
  } catch (error) {
    console.error('[verifyRegister]', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Email or phone number already registered.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 */
export async function getMe(req, res) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided.',
      });
    }

    const token = authHeader.slice(7);

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    const user = await findUserById(payload.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[getMe]', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
}