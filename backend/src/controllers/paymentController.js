// controllers/paymentController.js
const PaymentService = require('../services/paymentService');
const ErrorHandlerService = require('../services/errorHandlerService');
const ValidationService = require('../services/validationService');

// @desc    Process payment for appointment
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    const { appointmentId, amount, paymentMethod, cardDetails, insuranceDetails } = req.body;

    const paymentData = {
      appointmentId,
      patientId: req.user._id,
      amount: parseFloat(amount),
      paymentMethod,
      ...(paymentMethod === 'card' && { cardDetails }),
      ...(paymentMethod === 'insurance' && { insuranceDetails })
    };

    const result = await PaymentService.processPayment(paymentData);

    const response = ErrorHandlerService.createSuccessResponse(
      'Payment processed successfully',
      { 
        payment: result.payment,
        transaction: result.transaction
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Process payment');
    res.status(400).json(errorResponse);
  }
};

// Add to your paymentController.js
const validatePayment = async (req, res) => {
  try {
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    const { amount, paymentMethod, cardDetails, insuranceDetails } = req.body;

    // Validate payment details without creating a payment record
    if (paymentMethod === 'card') {
      // Validate card details
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Invalid card number');
      }
      if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        throw new Error('Invalid expiry date format (MM/YY required)');
      }
      if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
        throw new Error('Invalid CVV');
      }
      if (!cardDetails.cardHolder || cardDetails.cardHolder.trim().length < 2) {
        throw new Error('Invalid card holder name');
      }
    }

    const response = ErrorHandlerService.createSuccessResponse(
      'Payment validation successful'
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Validate payment');
    res.status(400).json(errorResponse);
  }
};

// @desc    Get payment by appointment ID
// @route   GET /api/payments/appointment/:appointmentId
// @access  Private
const getPaymentByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const payment = await PaymentService.getPaymentByAppointment(appointmentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this appointment'
      });
    }

    // Authorization check - patient can only see their own payments
    if (req.user.role === 'patient' && payment.patientID._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    const response = ErrorHandlerService.createSuccessResponse(
      'Payment retrieved successfully',
      { payment }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get payment');
    res.status(500).json(errorResponse);
  }
};

// @desc    Refund payment
// @route   POST /api/payments/:paymentId/refund
// @access  Private (Admin/Staff)
const refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.refundPayment(paymentId);

    const response = ErrorHandlerService.createSuccessResponse(
      'Payment refunded successfully',
      { payment }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Refund payment');
    res.status(400).json(errorResponse);
  }
};

// @desc    Calculate appointment charges
// @route   POST /api/payments/calculate-charges
// @access  Private
const calculateCharges = async (req, res) => {
  try {
    const { department, duration } = req.body;

    const charges = await calculateAppointmentCharges(department, duration);

    const response = ErrorHandlerService.createSuccessResponse(
      'Charges calculated successfully',
      { charges }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Calculate charges');
    res.status(400).json(errorResponse);
  }
};

// Helper function to calculate charges
const calculateAppointmentCharges = (department, duration = 30) => {
  const baseRates = {
    'Cardiology': 100,
    'Neurology': 120,
    'Pediatrics': 80,
    'Dermatology': 90,
    'Orthopedics': 110,
    'General': 50
  };

  const baseAmount = baseRates[department] || 50;
  const durationMultiplier = duration / 30; // 30min base
  const subtotal = baseAmount * durationMultiplier;
  
  // Calculate tax (if applicable)
  const taxRate = 0.1; // 10%
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    baseAmount,
    duration,
    subtotal,
    tax,
    total,
    currency: 'USD'
  };
};

module.exports = {
  processPayment,
  getPaymentByAppointment,
  refundPayment,
  calculateCharges,
  validatePayment
};