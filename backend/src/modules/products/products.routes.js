import { Router } from 'express';
import { getlistings, getProduct, postProduct, putProduct, uploadMiddleware, getInterestedUsers } from './products.controller.js';

const router = Router();

// GET /api/listings?subcategoryId=mobile&categoryId=electronics&sellerId=1&search=...&status=active
router.get('/', getlistings);

// GET /api/listings/:id
router.get('/:id', getProduct);

// GET /api/listings/:id/interested-users
router.get('/:id/interested-users', getInterestedUsers);

// POST /api/listings  (multipart/form-data with optional photos[])
router.post('/', uploadMiddleware, postProduct);

// PUT /api/listings/:id  (multipart/form-data with optional photos[])
router.put('/:id', uploadMiddleware, putProduct);

export default router;
