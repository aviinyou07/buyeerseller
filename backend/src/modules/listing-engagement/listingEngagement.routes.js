import { Router } from 'express';
import {
  getEngagement,
  postListingComment,
  postListingReview,
  toggleListingLike,
} from './listingEngagement.controller.js';

const router = Router();

router.get('/:listingId', getEngagement);
router.post('/:listingId/like', toggleListingLike);
router.post('/:listingId/reviews', postListingReview);
router.post('/:listingId/comments', postListingComment);

export default router;
