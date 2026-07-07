import { Router } from 'express';
import { getWishlist, addWishlist, deleteWishlist } from './wishlists.controller.js';

const router = Router();

router.get('/', getWishlist);                   // GET  /api/wishlists
router.post('/', addWishlist);                  // POST /api/wishlists
router.delete('/:productId', deleteWishlist);   // DELETE /api/wishlists/:productId

export default router;
