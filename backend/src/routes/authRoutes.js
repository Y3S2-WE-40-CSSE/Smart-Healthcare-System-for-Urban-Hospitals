const express = require('express');
const { body } = require('express-validator');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  createDoctor, 
  createAdmin 
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('contactInfo').notEmpty().withMessage('Contact information is required'),
  body('role').optional().isIn(['patient', 'staff']).withMessage('Invalid role for registration'),
  // Patient specific validations
  body('DOB').if(body('role').equals('patient')).notEmpty().withMessage('Date of birth is required for patients'),
  body('address').if(body('role').equals('patient')).notEmpty().withMessage('Address is required for patients'),
  // Staff specific validations
  body('department').if(body('role').equals('staff')).notEmpty().withMessage('Department is required for staff')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const doctorValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('contactInfo').notEmpty().withMessage('Contact information is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required')
];

const adminValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('contactInfo').notEmpty().withMessage('Contact information is required'),
  body('department').notEmpty().withMessage('Department is required')
];

// Public routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

// Protected routes
router.get('/me', protect, getMe);

// Admin routes
router.post('/admin/create-doctor', protect, authorize('admin', 'administrator'), doctorValidation, createDoctor);

// Super admin routes
router.post('/superadmin/create-admin', protect, authorize('administrator'), adminValidation, createAdmin);

module.exports = router;
