const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendBookingConfirmation, sendStatusUpdateEmail } = require('../utils/emailService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { items, guestDetails } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to book' });
    }

    // Validate quantity per item (prevent inventory exhaustion)
    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty < 1 || qty > 20) {
        return res.status(400).json({ success: false, message: `Invalid quantity for item. Must be between 1 and 20.` });
      }
      item.quantity = qty;
    }

    // Idempotency / Duplicate Prevention Check
    // Check if the user placed an identical order within the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentBooking = await Booking.findOne({
      user: req.user.id,
      createdAt: { $gte: thirtySecondsAgo }
    });

    if (recentBooking && JSON.stringify(recentBooking.items.map(i => i.itemId.toString()).sort()) === JSON.stringify(items.map(i => i.itemId).sort())) {
      return res.status(409).json({ success: false, message: 'Duplicate checkout detected. Please wait a moment before trying again.' });
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    // Server-side validation, price calculation, and availability check
    for (const item of items) {
      const { itemModel, itemId, quantity } = item;
      let dbItem;
      let unitPrice = 0;
      let itemName = '';

      if (itemModel === 'hotel') {
        const Property = require('../models/Property');
        dbItem = await Property.findById(itemId);
        if (!dbItem) throw new Error(`Hotel not found: ${itemId}`);
        
        const requestedRoomType = item.details?.roomType;
        const room = requestedRoomType 
          ? (dbItem.rooms.find(r => r.roomType?.toLowerCase() === requestedRoomType.toLowerCase()) || dbItem.rooms[0])
          : dbItem.rooms[0];

        if (!room) throw new Error(`No rooms available for hotel: ${dbItem.name}`);
        if (room.availableQuantity < quantity) throw new Error(`Not enough ${room.roomType} rooms available for: ${dbItem.name}`);
        
        unitPrice = room.price;
        itemName = requestedRoomType ? `${dbItem.name} (${room.roomType})` : dbItem.name;
        
        // Decrement inventory
        room.availableQuantity -= quantity;
        await dbItem.save();

      } else if (itemModel === 'bus') {
        const Bus = require('../models/Bus');
        dbItem = await Bus.findById(itemId);
        if (!dbItem) throw new Error(`Bus not found: ${itemId}`);
        if (dbItem.availableSeats < quantity) throw new Error(`Not enough seats on bus to ${dbItem.destination}`);
        
        unitPrice = dbItem.fare;
        itemName = `${dbItem.origin} to ${dbItem.destination}`;
        
        // Decrement inventory
        dbItem.availableSeats -= quantity;
        await dbItem.save();

      } else if (itemModel === 'tour') {
        const Tour = require('../models/Tour');
        dbItem = await Tour.findById(itemId);
        if (!dbItem) throw new Error(`Tour not found: ${itemId}`);
        
        unitPrice = dbItem.price;
        itemName = dbItem.title;

      } else if (itemModel === 'flight') {
        const Flight = require('../models/Flight');
        dbItem = await Flight.findById(itemId);
        if (!dbItem) throw new Error(`Flight not found: ${itemId}`);
        
        unitPrice = dbItem.price;
        itemName = `${dbItem.origin} to ${dbItem.destination}`;
      } else {
        throw new Error(`Invalid item model: ${itemModel}`);
      }

      calculatedTotal += unitPrice * quantity;
      
      validatedItems.push({
        itemType: itemModel, // Map 'itemModel' to 'itemType' for the schema
        itemId: itemId,
        name: itemName,
        price: unitPrice,
        quantity: quantity,
        selectedDate: item.selectedDate || item.date || item.details?.selectedDate || new Date().toISOString().split('T')[0],
        selectedTime: item.selectedTime || item.time || item.details?.selectedTime || 'Standard Slot',
        details: item.details || {}
      });
    }

    const booking = new Booking({
      user: req.user._id,
      items: validatedItems,
      totalAmount: calculatedTotal,
      status: 'pending', // Will be confirmed after mock payment
      details: guestDetails
    });

    const createdBooking = await booking.save();

    // Trigger transactional booking confirmation email
    if (req.user && req.user.email) {
      sendBookingConfirmation(req.user.email, req.user.name, createdBooking).catch(() => {});
    }

    res.status(201).json({ success: true, data: createdBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Make sure user owns the booking or is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Restore inventory
    for (const item of booking.items) {
      if (item.itemType === 'hotel') {
        const Property = require('../models/Property');
        const dbItem = await Property.findById(item.itemId);
        if (dbItem) {
          // Restore the specific room type that was booked
          const bookedRoomType = item.details?.roomType;
          const roomToRestore = bookedRoomType
            ? (dbItem.rooms.find(r => r.roomType?.toLowerCase() === bookedRoomType.toLowerCase()) || dbItem.rooms[0])
            : dbItem.rooms[0];
          if (roomToRestore) {
            roomToRestore.availableQuantity += item.quantity;
            await dbItem.save();
          }
        }
      } else if (item.itemType === 'bus') {
        const Bus = require('../models/Bus');
        const dbItem = await Bus.findById(item.itemId);
        if (dbItem) {
          dbItem.availableSeats += item.quantity;
          await dbItem.save();
        }
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    // Trigger transactional cancellation email
    if (req.user && req.user.email) {
      sendStatusUpdateEmail(req.user.email, req.user.name, booking._id.toString(), 'cancelled').catch(() => {});
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
