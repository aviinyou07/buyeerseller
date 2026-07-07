const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/auth.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

// Public route
router.post('/login', login);

// Protected routes
router.get('/me', protect, adminOnly, getMe);

module.exports = router;
