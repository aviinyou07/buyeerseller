import { Router } from 'express';
import { getOrders, getSales } from './orders.controller.js';

const router = Router();

// GET /api/orders
router.get('/', getOrders);

// GET /api/orders/sales
router.get('/sales', getSales);

export default router;
