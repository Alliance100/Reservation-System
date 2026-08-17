const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Bus = require('../models/Bus');
const Tour = require('../models/Tour');
const Flight = require('../models/Flight');

exports.getSupplierStats = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const properties = await Property.find({ owner: ownerId });
    const buses = await Bus.find({ owner: ownerId });
    const tours = await Tour.find({ owner: ownerId });
    const flights = await Flight.find({ owner: ownerId });

    const myItemIds = [
      ...properties.map(p => p._id.toString()),
      ...buses.map(b => b._id.toString()),
      ...tours.map(t => t._id.toString()),
      ...flights.map(f => f._id.toString())
    ];

    const totalInventoryCount = myItemIds.length;

    // Find all bookings that contain at least one of my items
    const bookings = await Booking.find({
      'items.itemId': { $in: myItemIds },
      status: { $ne: 'cancelled' }
    });

    let totalRevenue = 0;
    let totalBookings = 0;

    bookings.forEach(booking => {
      booking.items.forEach(item => {
        if (myItemIds.includes(item.itemId.toString())) {
          totalRevenue += (item.price * item.quantity);
          totalBookings += 1; // Count each matching item order
        }
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalInventoryCount,
        totalBookings,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSupplierInventory = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const properties = await Property.find({ owner: ownerId });
    const buses = await Bus.find({ owner: ownerId });
    const tours = await Tour.find({ owner: ownerId });
    const flights = await Flight.find({ owner: ownerId });

    res.status(200).json({
      success: true,
      data: {
        hotels: properties,
        buses,
        tours,
        flights
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSupplierBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const properties = await Property.find({ owner: ownerId });
    const buses = await Bus.find({ owner: ownerId });
    const tours = await Tour.find({ owner: ownerId });
    const flights = await Flight.find({ owner: ownerId });

    const myItemIds = [
      ...properties.map(p => p._id.toString()),
      ...buses.map(b => b._id.toString()),
      ...tours.map(t => t._id.toString()),
      ...flights.map(f => f._id.toString())
    ];

    const bookings = await Booking.find({
      'items.itemId': { $in: myItemIds }
    }).populate('user', 'name email').sort({ createdAt: -1 });

    // Filter items inside the bookings so supplier only sees their own items?
    // Let's just return the whole booking for simplicity or filter it.
    const filteredBookings = bookings.map(b => {
      const obj = b.toObject();
      obj.items = obj.items.filter(item => myItemIds.includes(item.itemId.toString()));
      return obj;
    });

    res.status(200).json({ success: true, count: filteredBookings.length, data: filteredBookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createInventory = async (req, res) => {
  try {
    const { type, ...data } = req.body;
    data.owner = req.user._id;

    let item;
    if (type === 'hotel' || type === 'hostel') {
      // Build location
      data.location = { city: data.city || 'Unknown', address: data.address || 'Unknown' };
      data.description = data.description || 'A beautiful property.';
      data.type = type;
      // Build rooms array since Property schema requires it instead of top-level price
      data.rooms = [{
        roomType: 'Standard Room',
        price: data.price || 0,
        capacity: 2,
        availableQuantity: data.availableQuantity || 0,
        amenities: ['Wi-Fi', 'AC']
      }];
      if (data.image) data.images = [data.image];
      item = await Property.create(data);

    } else if (type === 'bus') {
      data.departureTime = data.departureTime || new Date();
      data.arrivalTime = data.arrivalTime || new Date(Date.now() + 86400000); // +1 day
      data.availableSeats = data.totalSeats; // initialize
      if (data.image) data.images = [data.image];
      item = await Bus.create(data);

    } else if (type === 'tour') {
      data.pickupPoint = data.pickupPoint || 'Central Station';
      data.durationDays = data.durationDays || 1;
      data.maxGroupSize = data.maxGroupSize || 20;
      if (data.image) data.images = [data.image];
      item = await Tour.create(data);

    } else if (type === 'flight') {
      data.departureTime = data.departureTime || new Date();
      data.arrivalTime = data.arrivalTime || new Date(Date.now() + 14400000); // +4 hours
      data.duration = data.duration || '4h 0m';
      data.fareClass = data.fareClass || 'Economy';
      data.baggageAllowance = data.baggageAllowance || '20kg';
      if (data.image) data.images = [data.image];
      item = await Flight.create(data);

    } else {
      return res.status(400).json({ success: false, message: 'Invalid inventory type' });
    }

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("CREATE INVENTORY ERROR:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { type, id } = req.params;
    const updateData = { ...req.body };
    // Remove fields that should not be updated directly
    delete updateData.owner;
    delete updateData.type;

    let item;
    if (type === 'hotel' || type === 'hostel' || type === 'property') {
      if (updateData.city || updateData.address) {
        updateData.location = { city: updateData.city || 'Unknown', address: updateData.address || 'Unknown' };
      }
      if (updateData.price || updateData.availableQuantity) {
        updateData.rooms = [{
          roomType: 'Standard Room',
          price: updateData.price || 0,
          capacity: 2,
          availableQuantity: updateData.availableQuantity || 0,
          amenities: ['Wi-Fi', 'AC']
        }];
      }
      if (updateData.image) updateData.images = [updateData.image];
      item = await Property.findOneAndUpdate({ _id: id, owner: req.user._id }, updateData, { new: true });
    } else if (type === 'bus') {
      if (updateData.image) updateData.images = [updateData.image];
      item = await Bus.findOneAndUpdate({ _id: id, owner: req.user._id }, updateData, { new: true });
    } else if (type === 'tour') {
      if (updateData.image) updateData.images = [updateData.image];
      item = await Tour.findOneAndUpdate({ _id: id, owner: req.user._id }, updateData, { new: true });
    } else if (type === 'flight') {
      if (updateData.image) updateData.images = [updateData.image];
      item = await Flight.findOneAndUpdate({ _id: id, owner: req.user._id }, updateData, { new: true });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid inventory type' });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found or you are not the owner' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteInventory = async (req, res) => {
  try {
    const { type, id } = req.params;
    let item;
    
    if (type === 'hotel' || type === 'hostel' || type === 'property') {
      item = await Property.findOneAndDelete({ _id: id, owner: req.user._id });
    } else if (type === 'bus') {
      item = await Bus.findOneAndDelete({ _id: id, owner: req.user._id });
    } else if (type === 'tour') {
      item = await Tour.findOneAndDelete({ _id: id, owner: req.user._id });
    } else if (type === 'flight') {
      item = await Flight.findOneAndDelete({ _id: id, owner: req.user._id });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid inventory type' });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found or you are not the owner' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSupplierBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g. 'confirmed', 'rejected'
    
    // First find the booking
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Validate that the supplier actually owns at least one item in this booking
    const ownerId = req.user._id;
    const properties = await Property.find({ owner: ownerId });
    const buses = await Bus.find({ owner: ownerId });
    const tours = await Tour.find({ owner: ownerId });
    const flights = await Flight.find({ owner: ownerId });

    const myItemIds = [
      ...properties.map(p => p._id.toString()),
      ...buses.map(b => b._id.toString()),
      ...tours.map(t => t._id.toString()),
      ...flights.map(f => f._id.toString())
    ];

    const ownsItem = booking.items.some(item => myItemIds.includes(item.itemId.toString()));
    if (!ownsItem) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
