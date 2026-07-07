import jwt from 'jsonwebtoken';
import {
  createComment,
  createReview,
  getLikeState,
  listComments,
  listReviews,
  toggleLike,
} from './listingEngagement.queries.js';

function getUserFromToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function requireAuth(req, res) {
  const user = getUserFromToken(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return null;
  }

  return user;
}

const getListingId = (req) => Number(req.params.listingId || req.params.productId);

export async function getEngagement(req, res) {
  try {
    const listingId = getListingId(req);
    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Valid listing id is required.' });
    }

    const user = getUserFromToken(req);
    const [likeState, reviews, comments] = await Promise.all([
      getLikeState(listingId, user?.id),
      listReviews(listingId),
      listComments(listingId),
    ]);

    return res.json({
      success: true,
      engagement: {
        ...likeState,
        reviews,
        comments,
      },
    });
  } catch (error) {
    console.error('[listingEngagement.getEngagement]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function toggleListingLike(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const listingId = getListingId(req);
    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Valid listing id is required.' });
    }

    const likeState = await toggleLike(listingId, user.id);
    return res.json({ success: true, ...likeState });
  } catch (error) {
    console.error('[listingEngagement.toggleListingLike]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function postListingReview(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const listingId = getListingId(req);
    const rating = Number(req.body.rating || 5);
    const review = String(req.body.review || '').trim();

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Valid listing id is required.' });
    }
    if (!review) {
      return res.status(400).json({ success: false, message: 'Review is required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    const createdReview = await createReview({
      listingId,
      userId: user.id,
      rating,
      review,
    });

    return res.status(201).json({ success: true, review: createdReview });
  } catch (error) {
    console.error('[listingEngagement.postListingReview]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

export async function postListingComment(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const listingId = getListingId(req);
    const comment = String(req.body.comment || '').trim();

    if (!listingId) {
      return res.status(400).json({ success: false, message: 'Valid listing id is required.' });
    }
    if (!comment) {
      return res.status(400).json({ success: false, message: 'Comment is required.' });
    }

    const createdComment = await createComment({
      listingId,
      userId: user.id,
      comment,
    });

    return res.status(201).json({ success: true, comment: createdComment });
  } catch (error) {
    console.error('[listingEngagement.postListingComment]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
