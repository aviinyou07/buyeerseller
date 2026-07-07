const express = require('express');
const router = express.Router();
const { 
  listOrders, 
  getOrderDetails, 
  updateOrderStatus, 
  cancelOrder, 
  refundOrder 
} = require('../controllers/order.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/', listOrders);
router.get('/:id', getOrderDetails);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/cancel', cancelOrder);
router.post('/:id/refund', refundOrder);

module.exports = router;
