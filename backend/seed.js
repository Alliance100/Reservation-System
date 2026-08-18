require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Property = require('./models/Property');
const Bus = require('./models/Bus');
const Tour = require('./models/Tour');
const Flight = require('./models/Flight');
const Coupon = require('./models/Coupon');
const Booking = require('./models/Booking');

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
    await Booking.deleteMany({});

    console.log('Creating Admin...');
    const admin = await User.create({
      name: 'Global Admin',
      email: 'admin@ecotravel.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('Creating Supplier...');
    const supplier = await User.create({
      name: 'Global Supplier',
      email: 'supplier@ecotravel.com',
      password: 'password123',
      role: 'supplier'
    });

    console.log('Creating Customer...');
    const customer = await User.create({
      name: 'Demo Customer',
      email: 'customer@ecotravel.com',
      password: 'password123',
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

    console.log('Creating Realistic Bookings for Admin & Supplier Analytics...');
    const now = new Date();
    await Booking.insertMany([
      {
        user: customer._id,
        items: [{ itemType: 'hotel', itemId: null, name: 'Alpine Solar Sanctuary', price: 185, quantity: 2 }],
        totalAmount: 370,
        status: 'completed',
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000 + 3600000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'bus', itemId: null, name: 'Nordic Clean Express', price: 48, quantity: 2 }],
        totalAmount: 96,
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000 + 7200000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'tour', itemId: null, name: 'Amazon Rainforest Expedition', price: 450, quantity: 1 }],
        totalAmount: 450,
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 10800000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'flight', itemId: null, name: 'EcoAir EA-101', price: 290, quantity: 2 }],
        totalAmount: 580,
        status: 'completed',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 14400000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'hotel', itemId: null, name: 'Swiss Eco Lodge', price: 240, quantity: 3 }],
        totalAmount: 720,
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 18000000),
      },
      {
        user: customer._id,
        items: [
          { itemType: 'bus', itemId: null, name: 'GreenLine Electric Bus', price: 55, quantity: 2 },
          { itemType: 'tour', itemId: null, name: 'Costa Rica Canopy Trek', price: 320, quantity: 1 }
        ],
        totalAmount: 430,
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 21600000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'hotel', itemId: null, name: 'Santorini Solar Cliff Villa', price: 295, quantity: 2 }],
        totalAmount: 590,
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'tour', itemId: null, name: 'Nordic Aurora Experience', price: 620, quantity: 1 }],
        totalAmount: 620,
        status: 'completed',
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'hotel', itemId: null, name: 'Bali Bamboo Villa', price: 350, quantity: 2 }],
        totalAmount: 700,
        status: 'completed',
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        user: customer._id,
        items: [{ itemType: 'flight', itemId: null, name: 'Zero-Emission Flight Z-204', price: 410, quantity: 1 }],
        totalAmount: 410,
        status: 'confirmed',
        createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log('✅ SEEDING COMPLETE! All demo data loaded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
}

seedData();
