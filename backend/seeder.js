const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');
const Bus = require('./models/Bus');
const Tour = require('./models/Tour');
const Flight = require('./models/Flight');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const properties = [
  {
    name: 'Green Oasis Hotel',
    type: 'hotel',
    location: { city: 'New York', address: '123 Central Park West' },
    description: 'A beautiful eco-friendly hotel in the heart of the city.',
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    rating: 4.8,
    policies: ['No smoking', 'Pets allowed'],
    rooms: [
      { roomType: 'Deluxe Suite', price: 250, capacity: 2, availableQuantity: 5, amenities: ['WiFi', 'Balcony'] },
      { roomType: 'Standard Room', price: 150, capacity: 2, availableQuantity: 10, amenities: ['WiFi'] }
    ]
  },
  {
    name: 'Nature Vibes Hostel',
    type: 'hostel',
    location: { city: 'London', address: '45 Camden Lock' },
    description: 'Cozy and affordable stay for backpackers.',
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    rating: 4.2,
    policies: ['Quiet hours after 10 PM'],
    rooms: [
      { roomType: '6-Bed Dorm', price: 30, capacity: 1, availableQuantity: 20, amenities: ['Locker', 'Shared Bathroom'] }
    ]
  }
];

const buses = [
  {
    operator: 'EcoLines',
    origin: 'New York',
    destination: 'Boston',
    departureTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
    arrivalTime: new Date(new Date().getTime() + 28 * 60 * 60 * 1000),
    fare: 45,
    totalSeats: 40,
    availableSeats: 40,
    boardingPoints: ['Times Square', 'Port Authority'],
    dropPoints: ['South Station'],
    images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
  }
];

const tours = [
  {
    title: 'Forest Adventure 3 Days',
    durationDays: 3,
    itinerary: [
      { day: 1, description: 'Arrival and setup camp' },
      { day: 2, description: 'Hiking to the waterfall' },
      { day: 3, description: 'Departure' }
    ],
    price: 399,
    dates: [new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)], // Next week
    pickupPoint: 'City Center Plaza',
    inclusions: ['Tent', 'Meals', 'Guide'],
    exclusions: ['Sleeping bag'],
    images: ['https://images.unsplash.com/photo-1510312305653-8ed496efae75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    maxGroupSize: 15
  }
];

const flights = [
  {
    airline: 'GreenAir',
    flightNumber: 'GA-101',
    origin: 'JFK',
    destination: 'LHR',
    departureTime: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
    arrivalTime: new Date(new Date().getTime() + 2.3 * 24 * 60 * 60 * 1000), // ~7 hours later
    duration: '7h 15m',
    fareClass: 'Economy',
    price: 450,
    baggageAllowance: '1x 23kg',
  }
];

const importData = async () => {
  try {
    await Property.deleteMany();
    await Bus.deleteMany();
    await Tour.deleteMany();
    await Flight.deleteMany();

    await Property.insertMany(properties);
    await Bus.insertMany(buses);
    await Tour.insertMany(tours);
    await Flight.insertMany(flights);

    console.log('Data Imported successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
