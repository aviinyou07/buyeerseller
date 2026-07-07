const { ListingReport } = require('../models');
const { success, error, paginate } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * List all reported listings
 * GET /api/v1/admin/reports
 * Query: status (pending|resolved|rejected), reason, limit, page
 */
const listReports = async (req, res) => {
  const { status, reason, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch total count
    const totalItems = await ListingReport.count({ status, search: reason });

    // 2. Fetch paginated reports with joined listings, buyers, sellers
    const reports = await ListingReport.findPaginated({
      status,
      search: reason,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const processedReports = reports.map(r => ({
      id: r.id,
      reason: r.reason,
      status: r.status,
      reported_by: r.reported_by,
      listing_id: r.listing_id,
      reporter: { id: r.reported_by, full_name: r.reporter_name, phone: r.reporter_phone },
      listing: { 
        id: r.listing_id, 
        title: r.listing_title, 
        price: parseFloat(r.listing_price || 0), 
        listing_status: r.listing_status,
        seller: { id: r.seller_id, business_name: r.business_name, user: { id: r.seller_user_id, full_name: r.seller_name, phone: r.seller_phone } }
      }
    }));

    return paginate(res, 'Reports list retrieved successfully', processedReports, page, limit, totalItems);
  } catch (err) {
    console.error('List Reports error:', err);
    return error(res, 'An error occurred fetching reports', 500);
  }
};

/**
 * Resolve report and optionally take action against the seller
 * PATCH /api/v1/admin/reports/:id/resolve
 * Body payload: { actionAgainstSeller: 'block' | 'suspend' | 'warn' | 'none', remarks }
 */
const resolveReport = async (req, res) => {
  const { id } = req.params;
  const { actionAgainstSeller = 'none', remarks = '' } = req.body;

  try {
    const report = await ListingReport.findDetailsById(id);

    if (!report) {
      return error(res, 'Report not found', 404);
    }

    if (report.status !== 'pending') {
      return error(res, `Report is already ${report.status}`, 400);
    }

    await ListingReport.resolveReportTransactional(id, {
      actionAgainstSeller,
      sellerUserId: report.seller_user_id
    });

    if (actionAgainstSeller !== 'none' && report.seller_user_id) {
      const sellerUserId = report.seller_user_id;
      const sellerName = report.seller_name;

      if (actionAgainstSeller === 'block') {
        await logAdminAction(
          req.user.id,
          `Blocked seller '${sellerName}' due to resolved complaint ID: ${id}. ${remarks}`,
          'User',
          sellerUserId
        );
      } else if (actionAgainstSeller === 'suspend') {
        await logAdminAction(
          req.user.id,
          `Suspended seller '${sellerName}' due to resolved complaint ID: ${id}. ${remarks}`,
          'User',
          sellerUserId
        );
      }
    }

    await logAdminAction(
      req.user.id, 
      `Resolved report ID ${id} with seller action: ${actionAgainstSeller}`, 
      'ListingReport', 
      id
    );

    return success(res, `Report resolved successfully. Seller action: ${actionAgainstSeller}`);
  } catch (err) {
    console.error('Resolve Report error:', err);
    return error(res, 'An error occurred resolving report', 500);
  }
};

/**
 * Reject report (e.g. false alarm)
 * PATCH /api/v1/admin/reports/:id/reject
 */
const rejectReport = async (req, res) => {
  const { id } = req.params;

  try {
    const report = await ListingReport.findById(id);

    if (!report) {
      return error(res, 'Report not found', 404);
    }

    if (report.status !== 'pending') {
      return error(res, `Report is already ${report.status}`, 400);
    }

    await ListingReport.updateStatus(id, 'rejected');

    await logAdminAction(req.user.id, `Rejected report ID: ${id}`, 'ListingReport', id);

    return success(res, 'Report rejected successfully');
  } catch (err) {
    console.error('Reject Report error:', err);
    return error(res, 'An error occurred rejecting report', 500);
  }
};

module.exports = {
  listReports,
  resolveReport,
  rejectReport
};
