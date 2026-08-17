const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./models/Coupon');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected');
  
  await Coupon.deleteMany({});
  
  await Coupon.create({
    code: 'ECO2026',
    discountType: 'percentage',
    discountValue: 15,
    isActive: true
  });
  
  await Coupon.create({
    code: 'WELCOME50',
    discountType: 'fixed',
    discountValue: 50,
    isActive: true
  });

  console.log('Coupons seeded: ECO2026 (15%), WELCOME50 ($50)');
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
