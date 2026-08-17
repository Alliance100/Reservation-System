const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Mount routers
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const commerceRoutes = require('./routes/commerceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/commerce', commerceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supplier', supplierRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Reservation System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
