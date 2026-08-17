const express = require('express');
const { validateCoupon, simulatePayment } = require('../controllers/commerceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/validate-coupon', validateCoupon);
router.post('/charge', protect, simulatePayment);

module.exports = router;
