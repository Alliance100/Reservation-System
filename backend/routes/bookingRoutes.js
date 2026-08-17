const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createBooking);
router.route('/my-bookings').get(protect, getMyBookings);

module.exports = router;
