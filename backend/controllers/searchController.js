const Property = require('../models/Property');
const Bus = require('../models/Bus');
const Tour = require('../models/Tour');
const Flight = require('../models/Flight');

// @desc    Global search across all inventory
// @route   GET /api/search
// @access  Public
exports.searchInventory = async (req, res) => {
  try {
    const { type, location, minPrice, maxPrice } = req.query;

    if (!type) {
      return res.status(400).json({ success: false, message: 'Search type is required (hotel, bus, tour, flight)' });
    }

    let results = [];

    // Basic filtering based on type
    if (type === 'hotel') {
      const query = {};
      if (location) query['location.city'] = { $regex: location, $options: 'i' };
      results = await Property.find(query);
      
      // Filter by room price if provided
      if (minPrice || maxPrice) {
        results = results.filter(prop => {
          return prop.rooms.some(room => 
            (!minPrice || room.price >= Number(minPrice)) && 
            (!maxPrice || room.price <= Number(maxPrice))
          );
        });
      }
    } else if (type === 'bus') {
      const query = {};
      if (location) {
        // Just searching destination for simplicity
        query.destination = { $regex: location, $options: 'i' };
      }
      if (minPrice) query.fare = { $gte: Number(minPrice) };
      if (maxPrice) query.fare = { ...query.fare, $lte: Number(maxPrice) };
      results = await Bus.find(query);
    } else if (type === 'tour') {
      const query = {};
      if (location) query.title = { $regex: location, $options: 'i' };
      if (minPrice) query.price = { $gte: Number(minPrice) };
      if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
      results = await Tour.find(query);
    } else if (type === 'flight') {
      const query = {};
      if (location) query.destination = { $regex: location, $options: 'i' };
      if (minPrice) query.price = { $gte: Number(minPrice) };
      if (maxPrice) query.price = { ...query.price, $lte: Number(maxPrice) };
      results = await Flight.find(query);
    } else {
      return res.status(400).json({ success: false, message: 'Invalid search type' });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Simple detail fetchers
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: property });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: bus });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: tour });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: flight });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
