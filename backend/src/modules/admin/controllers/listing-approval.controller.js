const { Listing, ListingImage, ListingAttribute, ListingApprovalHistory } = require('../models');
const { success, error, paginate } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * Get Listing Approval Queue (listings awaiting moderation)
 * GET /api/v1/admin/listing-approvals/queue
 */
const getApprovalQueue = async (req, res) => {
  const { status = 'pending', limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch total count
    const totalItems = await Listing.count({ status });

    // 2. Fetch listings with joined category and seller details
    const listings = await Listing.findPaginated({
      status,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    // 3. Query images in bulk for these listings
    const listingIds = listings.map(l => l.id);
    let images = [];
    if (listingIds.length > 0) {
      images = await ListingImage.findByListings(listingIds);
    }

    const imageMap = {};
    images.forEach(img => {
      if (!imageMap[img.listing_id]) imageMap[img.listing_id] = [];
      imageMap[img.listing_id].push({
        id: img.id,
        image_url: img.image_url,
        is_thumbnail: img.is_thumbnail === 1 || img.is_thumbnail === true,
      });
    });

    const listingsWithImages = listings.map(l => ({
      id: l.id,
      uuid: l.uuid,
      title: l.title,
      price: parseFloat(l.price || 0),
      quantity: l.quantity,
      listing_status: l.listing_status,
      created_at: l.created_at,
      category: { id: l.category_id, name: l.category_name },
      seller: { id: l.seller_id, business_name: l.business_name, user: { full_name: l.seller_name, phone: l.seller_phone } },
      images: imageMap[l.id] || []
    }));

    return paginate(res, 'Listing approval queue retrieved', listingsWithImages, page, limit, totalItems);
  } catch (err) {
    console.error('Get Approval Queue error:', err);
    return error(res, 'An error occurred fetching approval queue', 500);
  }
};

/**
 * Get single listing approval details (including custom fields & approval history)
 * GET /api/v1/admin/listing-approvals/:id/details
 */
const getApprovalDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch listing details
    const listing = await Listing.findDetailsById(id);

    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    // 2. Fetch images
    const images = await ListingImage.findByListing(id);

    // 3. Fetch custom listing attributes (legacy table)
    const attributes = await ListingAttribute.findByListing(id);
    
    // Parse meta to extract overview fields (where new custom fields are stored)
    let parsedMeta = {};
    try {
      if (listing.meta) {
        parsedMeta = typeof listing.meta === 'string' ? JSON.parse(listing.meta) : listing.meta;
      }
    } catch (e) {
      console.error('Failed to parse listing meta', e);
    }
    const overviewFields = Array.isArray(parsedMeta) ? parsedMeta : (parsedMeta.overviewFields || parsedMeta.customFields || parsedMeta.customAttributes || parsedMeta.custom_fields || []);
    
    let condition = listing.condition;
    let warranty = listing.warranty;
    let usedFor = listing.used_for;
    const remainingAttributes = [];

    overviewFields.forEach(field => {
      const labelUpper = (field.label || '').toUpperCase();
      if (!condition && labelUpper.includes('CONDITION')) {
        condition = field.value;
      } else if (!warranty && labelUpper.includes('WARRANTY')) {
        warranty = field.value;
      } else if (!usedFor && labelUpper.includes('USED FOR')) {
        usedFor = field.value;
      } else {
        remainingAttributes.push({
          label: field.label || field.name,
          value: field.value,
          key: field.name || 'unknown',
          type: 'text'
        });
      }
    });
    
    const combinedCustomAttributes = [
      ...attributes.map(attr => ({
        attribute_id: attr.attribute_id,
        field_id: attr.field_id,
        label: attr.label || 'Unknown',
        key: attr.field_key || 'unknown',
        type: attr.field_type || 'text',
        value: attr.value
      })),
      ...remainingAttributes
    ];

    // 4. Fetch approval logs
    const approvals = await ListingApprovalHistory.findByListing(id);

    // Process output
    const details = {
      id: listing.id,
      uuid: listing.uuid,
      title: listing.title,
      description: listing.description,
      price: parseFloat(listing.price || 0),
      quantity: listing.quantity,
      listing_status: listing.listing_status,
      views_count: parseInt(listing.views_count || 0, 10),
      likes_count: parseInt(listing.likes_count || 0, 10),
      expires_at: listing.expires_at,
      is_featured: listing.is_featured === 1 || listing.is_featured === true,
      approved_at: listing.approved_at,
      created_at: listing.created_at,
      condition: condition,
      warranty: warranty,
      used_for: usedFor,
      brand: listing.brand,
      location: listing.location,
      category: { id: listing.category_id, name: listing.category_name },
      seller: { 
        id: listing.seller_id, 
        business_name: listing.business_name, 
        gst_number: listing.gst_number, 
        is_verified: listing.is_verified === 1 || listing.is_verified === true,
        user: { id: listing.user_id, full_name: listing.seller_name, phone: listing.seller_phone, email: listing.seller_email } 
      },
      images,
      custom_attributes: combinedCustomAttributes,
      approvals: approvals.map(app => ({
        id: app.id,
        action: app.action,
        remarks: app.remarks,
        created_at: app.created_at,
        admin: { full_name: app.admin_name }
      }))
    };

    return success(res, 'Listing details retrieved', details);
  } catch (err) {
    console.error('Get Approval Details error:', err);
    return error(res, 'An error occurred retrieving listing details', 500);
  }
};

/**
 * Moderate listing: Approve, Reject, or Request Changes
 * POST /api/v1/admin/listing-approvals/:id/moderate
 * Body payload: { action: 'approved' | 'rejected' | 'changes_requested', remarks }
 */
const moderateListing = async (req, res) => {
  const { id } = req.params;
  const { action, remarks = '' } = req.body;

  if (!['approved', 'rejected', 'changes_requested'].includes(action)) {
    return error(res, "Invalid action. Must be 'approved', 'rejected', or 'changes_requested'.", 400);
  }

  try {
    const listing = await Listing.findById(id);

    if (!listing) {
      return error(res, 'Listing not found', 404);
    }

    let nextStatus;
    let historyAction;

    if (action === 'approved') {
      nextStatus = 'approved';
      historyAction = 'approved';
    } else if (action === 'rejected') {
      nextStatus = 'rejected';
      historyAction = 'rejected';
    } else { // changes_requested
      nextStatus = 'draft';
      historyAction = 'rejected';
    }

    const approvedAt = action === 'approved' ? new Date() : null;

    await Listing.moderateListingTransactional(id, {
      nextStatus,
      approvedAt,
      adminId: req.user.id,
      historyAction,
      remarks: remarks || `Moderator performed ${action} action.`
    });

    await logAdminAction(
      req.user.id, 
      `Moderated listing '${listing.title}' with action: ${action}`, 
      'Listing', 
      id
    );

    return success(res, `Listing moderated successfully. Status set to: ${nextStatus}`, {
      listing_id: id,
      title: listing.title,
      listing_status: nextStatus
    });

  } catch (err) {
    console.error('Moderate Listing error:', err);
    return error(res, 'An error occurred during listing moderation', 500);
  }
};

module.exports = {
  getApprovalQueue,
  getApprovalDetails,
  moderateListing
};
