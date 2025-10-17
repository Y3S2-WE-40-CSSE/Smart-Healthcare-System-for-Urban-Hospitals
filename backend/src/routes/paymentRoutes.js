// routes/paymentRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  processPayment,
  getPaymentByAppointment,
  refundPayment,
  calculateCharges,
  validatePayment // Make sure this is imported
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation middleware
const paymentValidation = [
  body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('paymentMethod').isIn(['govt_coverage', 'insurance', 'cash', 'card']).withMessage('Valid payment method is required')
];

const cardPaymentValidation = [
  body('cardDetails.cardNumber').isLength({ min: 16, max: 19 }).withMessage('Valid card number is required'),
  body('cardDetails.expiryDate').matches(/^\d{2}\/\d{2}$/).withMessage('Valid expiry date (MM/YY) is required'),
  body('cardDetails.cvv').isLength({ min: 3, max: 4 }).withMessage('Valid CVV is required'),
  body('cardDetails.cardHolder').notEmpty().withMessage('Card holder name is required')
];

// Protected routes
router.post('/process', protect, paymentValidation, processPayment);
router.post('/validate', protect, validatePayment); // Add this route
router.get('/appointment/:appointmentId', protect, getPaymentByAppointment);
router.post('/calculate-charges', protect, calculateCharges);
router.post('/:paymentId/refund', protect, authorize('admin', 'staff'), refundPayment);

module.exports = router;