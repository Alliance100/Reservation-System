const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Tour = require('../models/Tour');
const Bus = require('../models/Bus');
const Flight = require('../models/Flight');

// Helper: recalculate and persist the average rating on the parent model
const recalculateRating = async (itemId, itemType) => {
  const reviews = await Review.find({ itemId, itemType });
  if (reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const rounded = Math.round(avgRating * 10) / 10; // 1 decimal place

  if (itemType === 'hotel') {
    await Property.findByIdAndUpdate(itemId, { rating: rounded });
  } else if (itemType === 'tour') {
    await Tour.findByIdAndUpdate(itemId, { rating: rounded });
  } else if (itemType === 'bus') {
    await Bus.findByIdAndUpdate(itemId, { rating: rounded });
  } else if (itemType === 'flight') {
    await Flight.findByIdAndUpdate(itemId, { rating: rounded });
  }
};

// @desc    Create a review (only for users with a completed booking for that item)
// @route   POST /api/reviews
// @access  Private (customer)
exports.createReview = async (req, res) => {
  try {
    const { itemId, itemType, rating, comment } = req.body;

    if (!itemId || !itemType || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'itemId, itemType, rating, and comment are required.' });
    }

    if (!['hotel', 'bus', 'tour', 'flight'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid itemType.' });
    }

    const parsedRating = Number(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5.' });
    }

    if (comment && comment.length > 1000) {
      return res.status(400).json({ success: false, message: 'Comment must be 1000 characters or fewer.' });
    }

    // Verify the user has a COMPLETED booking that includes this item
    const completedBooking = await Booking.findOne({
      user: req.user._id,
      status: 'completed',
      'items.itemId': itemId,
      'items.itemType': itemType,
    });

    if (!completedBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only review items from completed bookings.',
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({ user: req.user._id, itemId, itemType });
    if (existingReview) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this item.' });
    }

    const review = await Review.create({
      user: req.user._id,
      itemId,
      itemType,
      bookingId: completedBooking._id,
      rating: Number(rating),
      comment,
    });

    // Populate user name for the response
    await review.populate('user', 'name');

    // Recalculate and update the parent item's average rating
    await recalculateRating(itemId, itemType);

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this item.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a specific item
// @route   GET /api/reviews?itemId=&itemType=
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { itemId, itemType } = req.query;

    if (!itemId || !itemType) {
      return res.status(400).json({ success: false, message: 'itemId and itemType are required query params.' });
    }

    const reviews = await Review.find({ itemId, itemType })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if the logged-in user can review an item (has completed booking, hasn't reviewed yet)
// @route   GET /api/reviews/can-review?itemId=&itemType=
// @access  Private
exports.canReview = async (req, res) => {
  try {
    const { itemId, itemType } = req.query;

    const completedBooking = await Booking.findOne({
      user: req.user._id,
      status: 'completed',
      'items.itemId': itemId,
      'items.itemType': itemType,
    });

    if (!completedBooking) {
      return res.status(200).json({ success: true, canReview: false, reason: 'No completed booking for this item.' });
    }

    const existingReview = await Review.findOne({ user: req.user._id, itemId, itemType });
    if (existingReview) {
      return res.status(200).json({ success: true, canReview: false, reason: 'Already reviewed.', existingReview });
    }

    res.status(200).json({ success: true, canReview: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
