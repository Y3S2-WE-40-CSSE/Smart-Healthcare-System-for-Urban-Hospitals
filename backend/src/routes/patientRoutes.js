const express = require('express');
const { body } = require('express-validator');
const { 
  registerPatient, 
  getHealthCard, 
  getAllPatients, 
  updatePatient, 
  deletePatient 
} = require('../controllers/patientController');
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

// Get all patients
router.get(
  '/',
  protect,
  authorize('staff', 'doctor', 'admin', 'administrator'),
  getAllPatients
);

// Get patient health card
router.get(
  '/:patientId/health-card',
  protect,
  authorize('staff', 'doctor', 'admin', 'administrator', 'patient'),
  getHealthCard
);

// Update patient
router.put(
  '/:patientId',
  protect,
  authorize('staff', 'doctor', 'admin', 'administrator'),
  updatePatient
);

// Delete patient
router.delete(
  '/:patientId',
  protect,
  authorize('staff', 'admin', 'administrator'),
  deletePatient
);

module.exports = router;