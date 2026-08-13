const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  operator: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  fare: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  boardingPoints: [String],
  dropPoints: [String],
  images: [String],
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
