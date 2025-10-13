const User = require('../models/userModel');
const DigitalHealthCard = require('../models/digitalHealthCardModel');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// @desc    Register user (Patient/Staff only)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      password, 
      role, 
      contactInfo,
      department,
      DOB,
      address,
      allergies,
      medicalHistory
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Only allow patient and staff registration through this endpoint
    if (role && !['patient', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role for public registration. Only patients and staff can register.'
      });
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
      contactInfo
    };

    // Add role-specific fields
    if (userData.role === 'patient') {
      userData.DOB = DOB;
      userData.address = address;
      userData.allergies = allergies || 'None';
      userData.medicalHistory = medicalHistory || 'No significant medical history';
    } else if (userData.role === 'staff') {
      userData.department = department;
    }

    // Create user
    const user = await User.create(userData);

    // Create digital health card for patients
    if (user.role === 'patient') {
      const healthCard = await DigitalHealthCard.create({
        patientID: user._id,
        QRCode: `QR_${user._id}_${Date.now()}`,
        issuedBy: user._id // Self-issued for now
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.getPublicProfile(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create doctor (Admin only)
// @route   POST /api/admin/create-doctor
// @access  Private (Admin only)
const createDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      password, 
      contactInfo,
      department,
      specialization,
      licenseNumber
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if license number exists
    const existingLicense = await User.findOne({ licenseNumber });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'Doctor with this license number already exists'
      });
    }

    // Create doctor
    const doctor = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      contactInfo,
      department,
      specialization,
      licenseNumber,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        doctor: doctor.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during doctor creation'
    });
  }
};

// @desc    Create administrator (Super Admin only)
// @route   POST /api/superadmin/create-admin
// @access  Private (Administrator only)
const createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { 
      name, 
      email, 
      password, 
      contactInfo,
      department
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create admin
    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      contactInfo,
      department,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Administrator created successfully',
      data: {
        admin: admin.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin creation'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  createDoctor,
  createAdmin
};
