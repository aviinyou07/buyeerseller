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

/**
 * Update Admin Profile
 * PUT /api/v1/admin/auth/profile
 */
const updateProfile = async (req, res) => {
  const { full_name, email } = req.body;
  const adminId = req.user.id;

  if (!full_name || !email) {
    return error(res, 'Please provide full_name and email', 400);
  }

  try {
    await User.updateProfile(adminId, { full_name, email });
    const updatedUser = await User.findById(adminId);
    
    return success(res, 'Profile updated successfully', {
      admin: {
        id: updatedUser.id,
        uuid: updatedUser.uuid,
        full_name: updatedUser.full_name,
        phone: updatedUser.phone,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return error(res, 'Failed to update profile', 500);
  }
};

/**
 * Update Admin Password
 * PUT /api/v1/admin/auth/password
 */
const updatePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  const adminId = req.user.id;

  if (!current_password || !new_password) {
    return error(res, 'Please provide current_password and new_password', 400);
  }
  
  if (new_password.length < 8) {
    return error(res, 'New password must be at least 8 characters long', 400);
  }

  try {
    const user = await User.findById(adminId);
    if (!user) {
      return error(res, 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return error(res, 'Incorrect current password', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await User.updatePassword(adminId, hashedPassword);
    
    return success(res, 'Password updated successfully');
  } catch (err) {
    console.error('Update password error:', err);
    return error(res, 'Failed to update password', 500);
  }
};

module.exports = {
  login,
  getMe,
  updateProfile,
  updatePassword
};
