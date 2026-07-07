const express = require('express');
const router = express.Router();
const { listNotifications, sendNotification } = require('../controllers/notification.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listNotifications);
router.post('/send', sendNotification);

module.exports = router;
