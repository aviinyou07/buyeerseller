const express = require('express');
const router = express.Router();
const { 
  getApprovalQueue, 
  getApprovalDetails, 
  moderateListing 
} = require('../controllers/listing-approval.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/queue', getApprovalQueue);
router.get('/:id/details', getApprovalDetails);
router.post('/:id/moderate', moderateListing);

module.exports = router;
