const express = require('express');
const { body } = require('express-validator');
const {
  scanHealthCard,
  getPatientMedicalHistory,
  addVisitRecord,
  searchPatientByNIC
} = require('../controllers/medicalRecordController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation for adding visit record
const visitRecordValidation = [
  body('patientID').notEmpty().withMessage('Patient ID is required'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required'),
  body('treatmentNotes').notEmpty().withMessage('Treatment notes are required'),
  body('prescriptions').optional().isArray()
];

// Scan health card (QR/Barcode)
router.post(
  '/scan',
  protect,
  authorize('doctor', 'staff', 'admin', 'administrator'),
  scanHealthCard
);

// Get patient medical history
router.get(
  '/patient/:patientId',
  protect,
  authorize('doctor', 'staff', 'admin', 'administrator'),
  getPatientMedicalHistory
);

// Add new visit record
router.post(
  '/',
  protect,
  authorize('doctor', 'admin', 'administrator'),
  visitRecordValidation,
  addVisitRecord
);

// Manual search by NIC (fallback)
router.get(
  '/search/:nicNumber',
  protect,
  authorize('doctor', 'staff', 'admin', 'administrator'),
  searchPatientByNIC
);

// TEMPORARY: List all patients with their NICs (for debugging)
router.get(
  '/debug/list-patients',
  protect,
  authorize('doctor', 'admin', 'staff'),
  async (req, res) => {
    const User = require('../models/userModel');
    const patients = await User.find({ role: 'patient' })
      .select('name nicNumber email contactInfo')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: patients.length,
      data: patients.map(p => ({
        name: p.name,
        email: p.email,
        nicNumber: p.nicNumber,
        nicLength: p.nicNumber ? p.nicNumber.length : 0,
        nicHasSpaces: p.nicNumber ? (p.nicNumber !== p.nicNumber.trim()) : false,
        nicBytes: p.nicNumber ? Buffer.from(p.nicNumber).toString('hex') : null
      }))
    });
  }
);

module.exports = router;