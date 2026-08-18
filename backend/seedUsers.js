const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected');
  
  const password = await bcrypt.hash('password123', 10);
  
  // Seed Admin
  await User.findOneAndUpdate(
    { email: 'admin@ecotravel.com' },
    { name: 'Admin User', email: 'admin@ecotravel.com', password, role: 'admin' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Seed Supplier
  await User.findOneAndUpdate(
    { email: 'supplier@ecotravel.com' },
    { name: 'Eco Supplier', email: 'supplier@ecotravel.com', password, role: 'supplier' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Seed Customer
  await User.findOneAndUpdate(
    { email: 'customer@ecotravel.com' },
    { name: 'Demo Customer', email: 'customer@ecotravel.com', password, role: 'customer' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log('✅ Seeded all test accounts (password: password123)');
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
