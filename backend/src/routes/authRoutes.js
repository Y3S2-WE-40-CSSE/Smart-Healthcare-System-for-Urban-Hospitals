const express = require('express');
const { body } = require('express-validator');
const { 
  registerUser, 
  loginUser, 
  getMe
} = require('../controllers/authController');

const { 
  createDoctor, 
  createAdmin 
} = require('../controllers/adminUserController');

const { protect, authorize } = require('../middleware/authMiddleware');
const RoleConfigService = require('../services/roleConfigService');

const router = express.Router();

// Get allowed roles dynamically
const allowedRoles = RoleConfigService.getPublicRoles();

// Validation middleware
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('contactInfo').notEmpty().withMessage('Contact information is required'),
  body('role').optional().isIn(allowedRoles).withMessage(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`),
  
  // Conditional validations based on role
  body('DOB')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Date of birth is required for patients'),
  
  body('address')
    .if(body('role').equals('patient'))
    .notEmpty()
    .withMessage('Address is required for patients'),
  
  body('department')
    .if(body('role').isIn(['staff', 'doctor', 'admin']))
    .notEmpty()
    .withMessage('Department is required'),
  
  body('specialization')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('Specialization is required for doctors'),
  
  body('licenseNumber')
    .if(body('role').equals('doctor'))
    .notEmpty()
    .withMessage('License number is required for doctors')
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

// Admin routes (kept for backward compatibility)
router.post('/admin/create-doctor', protect, authorize('admin', 'administrator'), doctorValidation, createDoctor);

// Super admin routes
router.post('/superadmin/create-admin', protect, authorize('administrator'), adminValidation, createAdmin);

module.exports = router;