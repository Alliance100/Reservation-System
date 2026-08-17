const express = require('express');
const { 
  getSupplierStats, 
  getSupplierInventory, 
  getSupplierBookings,
  createInventory,
  updateInventory,
  deleteInventory,
  updateSupplierBookingStatus
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('supplier'));

router.get('/stats', getSupplierStats);
router.get('/inventory', getSupplierInventory);
router.post('/inventory', createInventory);
router.put('/inventory/:type/:id', updateInventory);
router.delete('/inventory/:type/:id', deleteInventory);

router.get('/bookings', getSupplierBookings);
router.put('/bookings/:id/status', updateSupplierBookingStatus);

module.exports = router;
