const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboard.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.get('/summary', protect, adminOnly, getSummary);

module.exports = router;
