const express = require('express');
const { searchInventory, getPropertyById, getBusById, getTourById, getFlightById } = require('../controllers/searchController');

const router = express.Router();

router.get('/', searchInventory);

// Also mounting detail routes here for simplicity (normally you'd separate them)
router.get('/properties/:id', getPropertyById);
router.get('/bus/:id', getBusById);
router.get('/tours/:id', getTourById);
router.get('/flights/:id', getFlightById);

module.exports = router;
