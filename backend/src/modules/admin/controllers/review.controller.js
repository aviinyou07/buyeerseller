const { ListingReview, ListingComment } = require('../models');
const { success, error, paginate } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * List all marketplace reviews
 * GET /api/v1/admin/comments-reviews/reviews
 * Query: rating, listing_id, search, limit, page
 */
const listReviews = async (req, res) => {
  const { rating, listing_id, search, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  const rateVal = rating ? parseInt(rating, 10) : null;
  const listId = listing_id ? parseInt(listing_id, 10) : null;

  try {
    // 1. Fetch total count
    const totalItems = await ListingReview.count({ rating: rateVal, listing_id: listId, search });

    // 2. Fetch paginated records
    const reviews = await ListingReview.findPaginated({
      rating: rateVal,
      listing_id: listId,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const processedReviews = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      created_at: r.created_at,
      listing_id: r.listing_id,
      user: { id: r.user_id, full_name: r.user_name, phone: r.user_phone },
      listing: { id: r.listing_id, title: r.listing_title }
    }));

    return paginate(res, 'Listing reviews retrieved successfully', processedReviews, page, limit, totalItems);
  } catch (err) {
    console.error('List Reviews error:', err);
    return error(res, 'An error occurred fetching reviews', 500);
  }
};

/**
 * List all marketplace comments
 * GET /api/v1/admin/comments-reviews/comments
 * Query: listing_id, search, limit, page
 */
const listComments = async (req, res) => {
  const { listing_id, search, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  const listId = listing_id ? parseInt(listing_id, 10) : null;

  try {
    // 1. Fetch total count
    const totalItems = await ListingComment.count({ listing_id: listId, search });

    // 2. Fetch paginated records
    const comments = await ListingComment.findPaginated({
      listing_id: listId,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const processedComments = comments.map(c => ({
      id: c.id,
      comment: c.comment,
      created_at: c.created_at,
      listing_id: c.listing_id,
      parent_comment_id: c.parent_comment_id,
      user: { id: c.user_id, full_name: c.user_name, phone: c.user_phone },
      listing: { id: c.listing_id, title: c.listing_title }
    }));

    return paginate(res, 'Listing comments retrieved successfully', processedComments, page, limit, totalItems);
  } catch (err) {
    console.error('List Comments error:', err);
    return error(res, 'An error occurred fetching comments', 500);
  }
};

/**
 * Delete Review
 * DELETE /api/v1/admin/comments-reviews/reviews/:id
 */
const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const review = await ListingReview.findDetailsById(id);

    if (!review) {
      return error(res, 'Review not found', 404);
    }

    await ListingReview.delete(id);

    await logAdminAction(
      req.user.id, 
      `Deleted review by user '${review.reviewer_name || 'Unknown'}' for Listing ID: ${review.listing_id}`, 
      'ListingReview', 
      id
    );

    return success(res, 'Review deleted successfully');
  } catch (err) {
    console.error('Delete Review error:', err);
    return error(res, 'An error occurred deleting review', 500);
  }
};

/**
 * Delete Comment
 * DELETE /api/v1/admin/comments-reviews/comments/:id
 */
const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await ListingComment.findDetailsById(id);

    if (!comment) {
      return error(res, 'Comment not found', 404);
    }

    await ListingComment.delete(id);

    await logAdminAction(
      req.user.id, 
      `Deleted comment by user '${comment.commenter_name || 'Unknown'}' for Listing ID: ${comment.listing_id}`, 
      'ListingComment', 
      id
    );

    return success(res, 'Comment deleted successfully');
  } catch (err) {
    console.error('Delete Comment error:', err);
    return error(res, 'An error occurred deleting comment', 500);
  }
};

module.exports = {
  listReviews,
  listComments,
  deleteReview,
  deleteComment
};
