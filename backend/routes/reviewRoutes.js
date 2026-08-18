const express = require('express');
const { createReview, getReviews, canReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public: get all reviews for an item
router.get('/', getReviews);

// Private: check eligibility to review
router.get('/can-review', protect, canReview);

// Private: submit a review
router.post('/', protect, createReview);

module.exports = router;
