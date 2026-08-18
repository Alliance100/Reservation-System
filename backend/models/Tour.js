const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  durationDays: { type: Number, required: true },
  itinerary: [{
    day: Number,
    description: String
  }],
  price: { type: Number, required: true },
  dates: [Date],
  pickupPoint: { type: String, required: true },
  inclusions: [String],
  exclusions: [String],
  images: [String],
  maxGroupSize: { type: Number, required: true },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Tour', tourSchema);
