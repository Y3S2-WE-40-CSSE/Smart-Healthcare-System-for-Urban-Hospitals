const express = require('express');
const { body } = require('express-validator');
const { registerPatient, getHealthCard } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware for patient registration
const patientRegistrationValidation = [
  body('name').notEmpty().withMessage('Patient name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('contactInfo').notEmpty().withMessage('Contact information is required'),
  body('DOB').notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format'),
  body('address').notEmpty().withMessage('Address is required'),
  body('nicNumber').optional(),
  body('allergies').optional(),
  body('medicalHistory').optional(),
  body('bloodGroup').optional(),
  body('emergencyContact').optional(),
  body('gender').optional()
];

// Staff-initiated patient registration
router.post(
  '/register',
  protect,
  authorize('staff', 'doctor', 'admin', 'administrator'),
  patientRegistrationValidation,
  registerPatient
);

// Get patient health card
router.get(
  '/:patientId/health-card',
  protect,
  authorize('staff', 'doctor', 'admin', 'administrator', 'patient'),
  getHealthCard
);

module.exports = router;