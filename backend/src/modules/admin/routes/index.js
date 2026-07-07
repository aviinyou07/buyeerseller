const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const categoryRoutes = require('./category.routes');
const dynamicFormRoutes = require('./dynamic-form.routes');
const customerRoutes = require('./customer.routes');
const listingApprovalRoutes = require('./listing-approval.routes');
const listingRoutes = require('./listing.routes');
const reviewRoutes = require('./review.routes');
const reportRoutes = require('./report.routes');
const orderRoutes = require('./order.routes');
const governmentSchemeRoutes = require('./government-scheme.routes');
const bannerRoutes = require('./banner.routes');
const cmsRoutes = require('./cms.routes');
const notificationRoutes = require('./notification.routes');
const auditLogRoutes = require('./audit-log.routes');
const analyticsRoutes = require('./analytics.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/categories', categoryRoutes);
router.use('/dynamic-forms', dynamicFormRoutes);
router.use('/customers', customerRoutes);
router.use('/listing-approvals', listingApprovalRoutes);
router.use('/listings', listingRoutes);
router.use('/comments-reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/orders', orderRoutes);
router.use('/government-schemes', governmentSchemeRoutes);
router.use('/banners', bannerRoutes);
router.use('/cms', cmsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
