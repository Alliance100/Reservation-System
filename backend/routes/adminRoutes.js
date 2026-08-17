const express = require('express');
const { getAdminStats, getAllBookings, getAllUsers, createCoupon, deleteCoupon, deleteUser, updateBookingStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
