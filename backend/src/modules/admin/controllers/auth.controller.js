const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { success, error } = require('../utils/response.utils');

/**
 * Admin / User Login
 * POST /api/v1/admin/auth/login
 */
const login = async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    return error(res, 'Please provide email or phone number and password', 400);
  }

  try {
    // Find the user by email or phone number using User model
    let user = null;
    if (email) {
      user = await User.findByEmail(email);
    } else if (phone) {
      user = await User.findByPhone(phone);
    }

    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }

    // Verify user role is admin
    if (user.role !== 'admin') {
      return error(res, 'Access denied. Only administrators are allowed.', 403);
    }

    // Verify account status
    if (user.account_status !== 'active') {
      return error(res, `Your account has been ${user.account_status}`, 403);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, 'Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super-enterprise-jwt-token-secret-2026-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return success(res, 'Logged in successfully', {
      token,
      admin: {
        id: user.id,
        uuid: user.uuid,
        full_name: user.full_name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        account_status: user.account_status
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'An error occurred during login', 500);
  }
};

/**
 * Get current admin profile
 * GET /api/v1/admin/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = req.user; // Attached by protect middleware
    return success(res, 'Admin profile retrieved successfully', {
      id: user.id,
      uuid: user.uuid,
      full_name: user.full_name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      account_status: user.account_status,
      created_at: user.created_at
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return error(res, 'An error occurred retrieving profile', 500);
  }
};

module.exports = {
  login,
  getMe
};
