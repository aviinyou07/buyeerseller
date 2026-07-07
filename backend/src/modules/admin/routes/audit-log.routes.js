const express = require('express');
const router = express.Router();
const { listAuditLogs } = require('../controllers/audit-log.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listAuditLogs);

module.exports = router;
