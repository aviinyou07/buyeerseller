const {
  User,
  SellerProfile,
  Listing,
  Category,
  Order,
  GovernmentScheme,
  ListingReport,
  ListingReview,
  ListingComment,
  Notification,
  AdminAuditLog,
  DailyStatistics,
} = require("../models");
const { success, error } = require("../utils/response.utils");

/**
 * Get Admin Dashboard Overview Summary & Widget Details
 * GET /api/v1/admin/dashboard/summary
 */
const getSummary = async (req, res) => {
  try {
    const [
      totalUsers,
      totalBuyersFetched,
      totalSellers,
      activeUsers,
      blockedUsers,
      pendingListings,
      approvedListings,
      rejectedListings,
      totalListings,
      totalCategories,
      totalOrders,
      totalRevenue,
      totalGovernmentSchemes,
      totalReports,
      totalReviews,
      totalComments,
      totalNotifications,
    ] = await Promise.all([
      User.countUsers({ role: "user" }),
      Order.countBuyers(),
      SellerProfile.count(),
      User.countUsers({ role: "user", status: "active" }),
      User.countUsers({ role: "user", status: "blocked" }),
      Listing.countByStatus("pending"),
      Listing.countByStatus("approved"),
      Listing.countByStatus("rejected"),
      Listing.count({}),
      Category.count({}),
      Order.countAll(),
      Order.sumRevenue(),
      GovernmentScheme.count({}),
      ListingReport.count({}),
      ListingReview.count({}),
      ListingComment.count({}),
      Notification.countAll(),
    ]);

    const totalBuyers = totalUsers - totalSellers;

    // 2. Fetch widget details in parallel
    const [
      latestRegisteredUsers,
      recentListingRequests,
      latestOrders,
      recentActivities,
      categoryAnalytics,
      chartAnalytics,
    ] = await Promise.all([
      User.findRecent(5),
      Listing.getRecentPending(5),
      Order.findRecent(5),
      AdminAuditLog.findPaginated({ limit: 5, offset: 0 }),
      Listing.getCategoryDistribution(),
      DailyStatistics.getRecent(7),
    ]);

    // New users this month (server-side)
    const monthly = await User.getMonthlyGrowth(1);
    const newThisMonth =
      monthly && monthly.length ? monthly[monthly.length - 1].registrations : 0;

    // Process audit logs for dashboard view
    const processedActivities = recentActivities.map((al) => ({
      id: al.id,
      action: al.action,
      entity_type: al.entity_type,
      entity_id: al.entity_id,
      created_at: al.created_at,
      admin_name: al.admin_name,
    }));

    // Reverse chart analytics for chronologically correct plotting
    chartAnalytics.reverse();

    return success(res, "Dashboard summary retrieved successfully", {
      counters: {
        totalUsers,
        totalBuyers,
        totalSellers,
        activeUsers,
        blockedUsers,
        pendingListings,
        approvedListings,
        rejectedListings,
        totalListings,
        newThisMonth,
        totalCategories,
        totalOrders,
        totalRevenue,
        totalGovernmentSchemes,
        totalReports,
        totalReviews,
        totalComments,
        totalNotifications,
      },
      widgets: {
        latestRegisteredUsers,
        recentListingRequests,
        latestOrders,
        recentActivities: processedActivities,
        categoryAnalytics,
        chartAnalytics,
      },
    });
  } catch (err) {
    console.error("Dashboard Summary error:", err);
    return error(res, "An error occurred fetching dashboard summary", 500);
  }
};

module.exports = {
  getSummary,
};
