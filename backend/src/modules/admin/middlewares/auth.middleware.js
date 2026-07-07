const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { error } = require('../utils/response.utils');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 'Not authorized, token missing', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-enterprise-jwt-token-secret-2026-key');
    
    // Find the user by id using User model
    const user = await User.findById(decoded.id);

    if (!user) {
      return error(res, 'User not found', 401);
    }

    // Verify account status
    if (user.account_status !== 'active') {
      return error(res, `Your account has been ${user.account_status}`, 403);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Not authorized, token expired or invalid', 401);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return error(res, 'Access denied: Admin role required', 403);
  }
};

module.exports = {
  protect,
  adminOnly
};
