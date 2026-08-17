const Booking = require('../models/Booking');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { items, totalAmount, guestDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to book' });
    }

    const booking = new Booking({
      user: req.user._id,
      items,
      totalAmount,
      status: 'confirmed', // Assuming confirmed immediately for Milestone 4 simulation
      details: guestDetails
    });

    const createdBooking = await booking.save();

    res.status(201).json({ success: true, data: createdBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
