const express = require('express');
const { createBooking, getMyBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createBooking);
router.route('/my-bookings').get(protect, getMyBookings);
router.route('/:id/cancel').put(protect, cancelBooking);

module.exports = router;
