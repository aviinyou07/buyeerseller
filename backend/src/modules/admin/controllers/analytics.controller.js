const { Listing, User, Order } = require('../models');
const { success, error } = require('../utils/response.utils');

/**
 * Get Advanced Analytics Report
 * GET /api/v1/admin/analytics/reports
 */
const getAnalytics = async (req, res) => {
  try {
    // 1. Fetch category distribution report
    const categoryReports = await Listing.getCategoryDistribution();

    // 2. Fetch listing status distribution report
    const listingStatusReports = await Listing.getStatusDistribution();

    // 3. Fetch user growth report (Past 6 Months)
    const userRegistrations = await User.getMonthlyGrowth(6);

    // 4. Fetch order and revenue report (Past 6 Months)
    const orderRevenueGrowth = await Order.getMonthlyRevenue(6);

    // Calculate Month-over-Month Growth Percentage
    const monthlyPerformance = orderRevenueGrowth.map((current, index) => {
      let revenueGrowthPercent = 0;
      let orderGrowthPercent = 0;

      if (index > 0) {
        const previous = orderRevenueGrowth[index - 1];
        const prevRevenue = parseFloat(previous.total_revenue || 0);
        const currRevenue = parseFloat(current.total_revenue || 0);
        const prevOrders = parseInt(previous.total_orders || 0, 10);
        const currOrders = parseInt(current.total_orders || 0, 10);

        if (prevRevenue > 0) {
          revenueGrowthPercent = (((currRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1);
        }
        if (prevOrders > 0) {
          orderGrowthPercent = (((currOrders - prevOrders) / prevOrders) * 100).toFixed(1);
        }
      }

      return {
        month: current.month,
        totalOrders: parseInt(current.total_orders || 0, 10),
        totalRevenue: parseFloat(current.total_revenue || 0),
        orderGrowthPercentage: parseFloat(orderGrowthPercent),
        revenueGrowthPercentage: parseFloat(revenueGrowthPercent)
      };
    });

    return success(res, 'Analytics report generated successfully', {
      categoryReports,
      listingStatusReports,
      userRegistrations,
      monthlyPerformance
    });

  } catch (err) {
    console.error('Get Analytics error:', err);
    return error(res, 'An error occurred compiling analytics reports', 500);
  }
};

module.exports = {
  getAnalytics
};
