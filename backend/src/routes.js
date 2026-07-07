import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import categoriesRoutes from './modules/categories/categories.routes.js';
import listingsRoutes from './modules/products/products.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import wishlistsRoutes from './modules/wishlists/wishlists.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import schemesRoutes from './modules/schemes/schemes.routes.js';
import listingEngagementRoutes from './modules/listing-engagement/listingEngagement.routes.js';

const router = Router();

// ─── Modules ──────────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
// router.use('/admin', adminRoutes);
router.use('/categories', categoriesRoutes);
router.use('/listings', listingsRoutes);
router.use('/orders', ordersRoutes);
router.use('/wishlists', wishlistsRoutes);
router.use('/users', usersRoutes);
router.use('/schemes', schemesRoutes);
router.use('/listings', listingEngagementRoutes);

export default router;
