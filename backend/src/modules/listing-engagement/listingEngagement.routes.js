import { Router } from 'express';
import {
  getEngagement,
  postListingComment,
  postListingReview,
  toggleListingLike,
  recordInteraction
} from './listingEngagement.controller.js';

const router = Router();

router.get('/:listingId', getEngagement);
router.post('/:listingId/like', toggleListingLike);
router.post('/:listingId/reviews', postListingReview);
router.post('/:listingId/comments', postListingComment);
router.post('/:listingId/interact', recordInteraction);

export default router;
