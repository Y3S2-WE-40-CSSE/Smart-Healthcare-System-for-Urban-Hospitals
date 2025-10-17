require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes');
const medicalRecordRoutes = require('./routes/medicalRecordRoutes'); // ✅ ADD THIS

const app = express();

// Connect to database
connectDB();

// Create super admin if doesn't exist
const createSuperAdmin = async () => {
  try {
    const superAdmin = await User.findOne({ role: 'administrator' });
    if (!superAdmin) {
      await User.create({
        name: 'Super Administrator',
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@hospital.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
        role: 'administrator',
        contactInfo: 'System Administrator',
        department: 'Administration'
      });
      console.log('Super Administrator created successfully');
    }
  } catch (error) {
    console.error('Error creating super admin:', error);
  }
};

// Create super admin on startup
createSuperAdmin();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/medical-records', medicalRecordRoutes); // ✅ ADD THIS LINE

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Healthcare System API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;