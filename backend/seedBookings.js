const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Property = require('./models/Property');
const Bus = require('./models/Bus');
const Tour = require('./models/Tour');
const Flight = require('./models/Flight');

async function seedCleanBookings() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);

    const customer = await User.findOne({ email: 'customer@ecotravel.com' }) || await User.findOne({});
    const supplier = await User.findOne({ email: 'supplier@ecotravel.com' });
    const property = await Property.findOne({ owner: supplier?._id }) || await Property.findOne({});
    const bus = await Bus.findOne({ owner: supplier?._id }) || await Bus.findOne({});
    const tour = await Tour.findOne({ owner: supplier?._id }) || await Tour.findOne({});
    const flight = await Flight.findOne({ owner: supplier?._id }) || await Flight.findOne({});

    if (!customer) {
      console.log('No user found.');
      process.exit(1);
    }

    console.log('Removing old historical dummy bookings...');
    await Booking.deleteMany({});

    // Current reference: Today is 2026-08-18, Yesterday was 2026-08-17
    const now = new Date();
    
    // Dates starting strictly from Yesterday (2026-08-17) and Today (2026-08-18)
    const yesterdayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 9, 30, 0);
    const yesterdayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 13, 15, 0);
    const yesterdayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 45, 0);
    const yesterdayEvening = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 20, 10, 0);
    
    const todayEarlyMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 20, 0);
    const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 15, 0);
    const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 45, 0);
    const todayRecent = new Date(now.getTime() - 25 * 60 * 1000); // 25 mins ago

    const realBookings = [
      // ── YESTERDAY (Day 1 - Launch Day: 2026-08-17) ───────────────────────────
      {
        user: customer._id,
        items: [
          {
            itemType: 'hotel',
            itemId: property?._id,
            name: property?.name || 'Alpine Solar Sanctuary',
            price: property?.rooms?.[0]?.price || 185,
            quantity: 2
          }
        ],
        totalAmount: (property?.rooms?.[0]?.price || 185) * 2,
        status: 'completed',
        createdAt: yesterdayMorning
      },
      {
        user: customer._id,
        items: [
          {
            itemType: 'bus',
            itemId: bus?._id,
            name: bus?.operator || 'GreenLine EV Express',
            price: bus?.fare || 48,
            quantity: 2
          }
        ],
        totalAmount: (bus?.fare || 48) * 2,
        status: 'confirmed',
        createdAt: yesterdayNoon
      },
      {
        user: customer._id,
        items: [
          {
            itemType: 'tour',
            itemId: tour?._id,
            name: tour?.title || 'Swiss Alps Glacier Eco Trek',
            price: tour?.price || 320,
            quantity: 1
          }
        ],
        totalAmount: tour?.price || 320,
        status: 'confirmed',
        createdAt: yesterdayAfternoon
      },
      {
        user: customer._id,
        items: [
          {
            itemType: 'flight',
            itemId: flight?._id,
            name: flight?.airline ? `${flight.airline} (${flight.flightNumber})` : 'EcoAir Flight EA-101',
            price: flight?.price || 290,
            quantity: 2
          }
        ],
        totalAmount: (flight?.price || 290) * 2,
        status: 'confirmed',
        createdAt: yesterdayEvening
      },

      // ── TODAY (Day 2: 2026-08-18) ───────────────────────────────────────────
      {
        user: customer._id,
        items: [
          {
            itemType: 'hotel',
            itemId: property?._id,
            name: property?.name || 'Alpine Solar Sanctuary',
            price: property?.rooms?.[0]?.price || 185,
            quantity: 3
          }
        ],
        totalAmount: (property?.rooms?.[0]?.price || 185) * 3,
        status: 'confirmed',
        createdAt: todayEarlyMorning
      },
      {
        user: customer._id,
        items: [
          {
            itemType: 'tour',
            itemId: tour?._id,
            name: tour?.title || 'Swiss Alps Glacier Eco Trek',
            price: tour?.price || 320,
            quantity: 2
          }
        ],
        totalAmount: (tour?.price || 320) * 2,
        status: 'confirmed',
        createdAt: todayMorning
      },
      {
        user: customer._id,
        items: [
          {
            itemType: 'bus',
            itemId: bus?._id,
            name: bus?.operator || 'GreenLine EV Express',
            price: bus?.fare || 48,
            quantity: 3
          }
        ],
        totalAmount: (bus?.fare || 48) * 3,
        status: 'confirmed',
        createdAt: todayNoon
      },
      {
        user: customer._id,
        items: [
          {
            itemType: 'hotel',
            itemId: property?._id,
            name: property?.name || 'Alpine Solar Sanctuary',
            price: property?.rooms?.[0]?.price || 185,
            quantity: 2
          },
          {
            itemType: 'bus',
            itemId: bus?._id,
            name: bus?.operator || 'GreenLine EV Express',
            price: bus?.fare || 48,
            quantity: 2
          }
        ],
        totalAmount: ((property?.rooms?.[0]?.price || 185) * 2) + ((bus?.fare || 48) * 2),
        status: 'confirmed',
        createdAt: todayRecent
      }
    ];

    await Booking.insertMany(realBookings);
    console.log(`✅ Successfully stored ${realBookings.length} real bookings starting from Yesterday (2026-08-17) and Today (2026-08-18)!`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding bookings:', err);
    process.exit(1);
  }
}

seedCleanBookings();
