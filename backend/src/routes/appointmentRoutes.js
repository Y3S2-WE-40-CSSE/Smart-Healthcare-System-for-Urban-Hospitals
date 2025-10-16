const express = require('express');
const { body } = require('express-validator');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getAvailableDoctors
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const appointmentValidation = [
  body('doctorID').isMongoId().withMessage('Valid doctor ID is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('dateTime').isISO8601().withMessage('Valid date and time is required'),
  body('reason').notEmpty().withMessage('Reason for appointment is required')
];

// Protected routes
router.post('/', protect, appointmentValidation, createAppointment);
router.get('/', protect, getAppointments);
router.get('/my-appointments', protect, getPatientAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/doctors/available', protect, getAvailableDoctors);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);

module.exports = router;