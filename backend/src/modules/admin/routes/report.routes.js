const express = require('express');
const router = express.Router();
const { 
  listReports, 
  resolveReport, 
  rejectReport 
} = require('../controllers/report.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listReports);
router.patch('/:id/resolve', resolveReport);
router.patch('/:id/reject', rejectReport);

module.exports = router;
