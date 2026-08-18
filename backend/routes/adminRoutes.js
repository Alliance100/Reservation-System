const express = require('express');
const { getAdminStats, getAllBookings, getAllUsers, createCoupon, updateCoupon, deleteCoupon, getAllCoupons, deleteUser, updateBookingStatus, updateUserRole, verifySupplier } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/verify', verifySupplier);

router.get('/coupons', getAllCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
