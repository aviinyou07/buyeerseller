const express = require('express');
const router = express.Router();
const { login, getMe, updateProfile, updatePassword } = require('../controllers/auth.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Public route
router.post('/login', login);

// Protected routes
router.get('/me', protect, adminOnly, getMe);
router.put('/profile', protect, adminOnly, updateProfile);
router.put('/password', protect, adminOnly, updatePassword);

module.exports = router;
