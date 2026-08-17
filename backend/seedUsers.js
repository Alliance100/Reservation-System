const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log('MongoDB Connected');
  
  const password = await bcrypt.hash('123456', 10);
  
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

  console.log('Seeded admin@ecotravel.com and supplier@ecotravel.com (password: 123456)');
  process.exit();
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
