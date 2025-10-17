// routes/appointmentRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  createAppointmentWithPayment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getAvailableDoctors,
  getAvailableSlots,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const appointmentValidation = [
  body('doctorID').isMongoId().withMessage('Valid doctor ID is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('dateTime').isISO8601().withMessage('Valid date and time is required'),
  body('reason').notEmpty().withMessage('Reason for appointment is required'),
  body('duration').optional().isInt({ min: 15, max: 60 }).withMessage('Duration must be between 15 and 60 minutes')
];

// Protected routes
router.post('/', protect, appointmentValidation, createAppointmentWithPayment);
router.get('/', protect, getAppointments);
router.get('/my-appointments', protect, getPatientAppointments);
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.get('/doctors/available', protect, getAvailableDoctors);
router.get('/doctors/:doctorId/slots', protect, getAvailableSlots);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, updateAppointment);
router.patch('/:id/cancel', protect, cancelAppointment);
router.delete('/:id', protect, deleteAppointment);

module.exports = router;