require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Property = require('./models/Property');
const Bus = require('./models/Bus');
const Tour = require('./models/Tour');
const Flight = require('./models/Flight');
const Coupon = require('./models/Coupon');

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Clearing old data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Bus.deleteMany({});
    await Tour.deleteMany({});
    await Flight.deleteMany({});
    await Coupon.deleteMany({});

    console.log('Creating Admin...');
    const admin = await User.create({
      name: 'Global Admin',
      email: 'admin@ecotravel.com',
      password: '123456',
      role: 'admin'
    });

    console.log('Creating Supplier...');
    const supplier = await User.create({
      name: 'Global Supplier',
      email: 'supplier@ecotravel.com',
      password: '123456',
      role: 'supplier'
    });

    console.log('Creating Customer...');
    const customer = await User.create({
      name: 'Demo Customer',
      email: 'customer@ecotravel.com',
      password: '123456',
      role: 'customer'
    });

    console.log('Creating Mock Inventory for Supplier...');
    // Hotel
    await Property.create({
      name: 'Grand Eco Resort',
      owner: supplier._id,
      type: 'hotel',
      location: { city: 'Bali', address: '123 Beach Rd' },
      description: 'A beautiful sustainable resort in Bali.',
      images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      rooms: [{ roomType: 'Ocean View', price: 150, capacity: 2, availableQuantity: 10, amenities: ['Wi-Fi', 'Pool'] }]
    });

    // Flight
    await Flight.create({
      airline: 'EcoAir',
      owner: supplier._id,
      flightNumber: 'EA-101',
      origin: 'New York',
      destination: 'London',
      departureTime: new Date(Date.now() + 86400000), // Tomorrow
      arrivalTime: new Date(Date.now() + 86400000 + 21600000), // + 6 hours
      duration: '6h 0m',
      fareClass: 'Economy',
      price: 450,
      baggageAllowance: '20kg'
    });

    // Bus
    await Bus.create({
      operator: 'GreenLine',
      owner: supplier._id,
      origin: 'Berlin',
      destination: 'Munich',
      departureTime: new Date(Date.now() + 86400000),
      arrivalTime: new Date(Date.now() + 86400000 + 14400000), // + 4 hours
      fare: 35,
      totalSeats: 40,
      availableSeats: 40,
      boardingPoints: ['Central Station'],
      dropPoints: ['Munich Main'],
      images: []
    });

    // Tour
    await Tour.create({
      title: 'Amazon Rainforest Expedition',
      owner: supplier._id,
      durationDays: 5,
      itinerary: [{ day: 1, description: 'Arrival' }],
      price: 800,
      dates: [new Date(Date.now() + 86400000 * 7)],
      pickupPoint: 'Manaus Airport',
      inclusions: ['Guide', 'Meals'],
      exclusions: ['Flights'],
      images: ['https://images.unsplash.com/photo-1518182170546-076616fdcb12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      maxGroupSize: 15
    });

    console.log('Creating Promo Coupon...');
    await Coupon.create({
      code: 'WELCOME2026',
      discountType: 'percentage',
      discountValue: 10,
      isActive: true,
      minPurchaseAmount: 50,
      validUntil: new Date(Date.now() + 86400000 * 30) // Valid for 30 days
    });

    console.log('✅ SEEDING COMPLETE! All demo data loaded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedData();
