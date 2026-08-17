const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomType: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  availableQuantity: { type: Number, required: true },
  amenities: [String],
});

const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['hotel', 'hostel'], required: true },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
  },
  description: { type: String, required: true },
  images: [String],
  rating: { type: Number, default: 0 },
  policies: [String],
  rooms: [roomSchema],
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
