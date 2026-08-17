const Coupon = require('../models/Coupon');

// @desc    Validate a promo code
// @route   POST /api/commerce/validate-coupon
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    
    if (!coupon.isActive) return res.status(400).json({ success: false, message: 'Coupon is no longer active' });
    
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate payment gateway
// @route   POST /api/commerce/charge
// @access  Private
exports.simulatePayment = async (req, res) => {
  try {
    const { cardNumber, amount } = req.body;
    
    // Simple mock logic: if card ends in 4242, success. Otherwise fail.
    if (cardNumber && cardNumber.endsWith('4242')) {
      return res.status(200).json({
        success: true,
        transactionId: `txn_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded'
      });
    } else {
      return res.status(400).json({ success: false, message: 'Payment declined. Card must end in 4242 for testing.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
