const express = require('express');
const router = express.Router();
const { 
  listReviews, 
  listComments, 
  deleteReview, 
  deleteComment 
} = require('../controllers/review.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(adminOnly);

router.get('/reviews', listReviews);
router.get('/comments', listComments);
router.delete('/reviews/:id', deleteReview);
router.delete('/comments/:id', deleteComment);

module.exports = router;
