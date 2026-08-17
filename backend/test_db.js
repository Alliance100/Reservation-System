const mongoose = require('mongoose');
const Property = require('./models/Property');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/reservation').then(async () => {
  console.log('Connected to DB');
  
  const search = await Property.find({
    $or: [
      { 'location.city': { $regex: 'hell', $options: 'i' } },
      { name: { $regex: 'hell', $options: 'i' } }
    ]
  });
  console.log('Search Results for "hell":', JSON.stringify(search, null, 2));

  // Also query by owner or exactly
  const allProps = await Property.find({ name: /hell/i });
  console.log('Direct name search:', JSON.stringify(allProps, null, 2));
  
  process.exit(0);
}).catch(console.error);
