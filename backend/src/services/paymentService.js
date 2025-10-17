const Payment = require('../models/paymentModel');
const Appointment = require('../models/appointmentModel');

class PaymentService {
  /**
   * Process payment for an appointment
   */
  static async processPayment(paymentData) {
  const { appointmentId, patientId, amount, paymentMethod, cardDetails, insuranceDetails } = paymentData;
  
  try {
    let paymentResult;

    // Handle different payment methods
    switch (paymentMethod) {
      case 'govt_coverage':
        paymentResult = await this.processGovernmentCoverage(amount);
        break;
      
      case 'insurance':
        paymentResult = await this.processInsurancePayment(amount, insuranceDetails);
        break;
      
      case 'cash':
        paymentResult = await this.processCashPayment(amount);
        break;
      
      case 'card':
        paymentResult = await this.processCardPayment(amount, cardDetails);
        break;
      
      default:
        throw new Error('Invalid payment method');
    }

    // Ensure transactionId exists
    if (!paymentResult.transactionId) {
      paymentResult.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    }

    // Create payment record
    const payment = await Payment.create({
      appointmentID: appointmentId,
      patientID: patientId,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentResult.status,
      transactionId: paymentResult.transactionId, // Always set this
      gatewayResponse: paymentResult.gatewayResponse,
      ...(paymentMethod === 'card' && {
        cardDetails: {
          last4: cardDetails?.cardNumber?.slice(-4),
          brand: this.detectCardBrand(cardDetails?.cardNumber),
          expiryMonth: parseInt(cardDetails?.expiryDate?.split('/')[0]),
          expiryYear: parseInt('20' + cardDetails?.expiryDate?.split('/')[1])
        }
      }),
      ...(paymentMethod === 'insurance' && {
        insuranceDetails: insuranceDetails
      }),
      ...(paymentMethod === 'govt_coverage' && {
        govtCoverageDetails: {
          scheme: 'National Healthcare',
          referenceNumber: paymentResult.transactionId // Use transactionId as reference
        }
      })
    });

    // Update appointment payment status
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: paymentResult.status,
      paymentMethod: paymentMethod,
      amount: amount
    });

    return {
      success: true,
      payment,
      transaction: paymentResult
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Create failed payment record with unique transactionId
    await Payment.create({
      appointmentID: appointmentId,
      patientID: patientId,
      amount: amount,
      paymentMethod: paymentMethod,
      paymentStatus: 'failed',
      transactionId: `FAIL${Date.now()}${Math.floor(Math.random() * 1000)}`,
      gatewayResponse: { error: error.message }
    });

    throw new Error(`Payment processing failed: ${error.message}`);
  }
}

  /**
   * Process government coverage (no actual payment)
   */
  static async processGovernmentCoverage(amount) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    status: 'covered',
    transactionId: `GOV${Date.now()}${Math.floor(Math.random() * 1000)}`, // Always generate
    gatewayResponse: { message: 'Government coverage applied successfully' }
  };
}

  /**
   * Process insurance payment
   */
  static async processInsurancePayment(amount, insuranceDetails) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (!insuranceDetails?.provider) {
    throw new Error('Insurance provider details required');
  }

  return {
    success: true,
    status: 'covered',
    transactionId: `INS${Date.now()}${Math.floor(Math.random() * 1000)}`, // Always generate
    gatewayResponse: { 
      message: 'Insurance claim submitted',
      provider: insuranceDetails.provider
    }
  };
}

  /**
   * Process cash payment (mark as pending)
   */
  static async processCashPayment(amount) {
  return {
    success: true,
    status: 'pending',
    transactionId: `CASH${Date.now()}${Math.floor(Math.random() * 1000)}`, // Always generate
    gatewayResponse: { message: 'Payment to be collected at hospital' }
  };
}

  /**
   * Process card payment (integrate with actual gateway in production)
   */
  static async processCardPayment(amount, cardDetails) {
  if (!this.validateCardDetails(cardDetails)) {
    throw new Error('Invalid card details');
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  if (Math.random() < 0.1) {
    throw new Error('Payment declined by bank. Please check your card details.');
  }

  return {
    success: true,
    status: 'paid',
    transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`, // Always generate
    gatewayResponse: {
      message: 'Payment processed successfully',
      authCode: `AUTH${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    }
  };
}

  /**
   * Validate card details
   */
  static validateCardDetails(cardDetails) {
    const { cardNumber, expiryDate, cvv, cardHolder } = cardDetails;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      throw new Error('Invalid card number');
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      throw new Error('Invalid expiry date format (MM/YY required)');
    }
    
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      throw new Error('Invalid CVV');
    }
    
    if (!cardHolder || cardHolder.trim().length < 2) {
      throw new Error('Invalid card holder name');
    }

    // Check if card is expired
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiry < new Date()) {
      throw new Error('Card has expired');
    }

    return true;
  }

  /**
   * Detect card brand
   */
  static detectCardBrand(cardNumber) {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'MasterCard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
    
    return 'Unknown';
  }

  /**
   * Get payment by appointment ID
   */
  static async getPaymentByAppointment(appointmentId) {
    return await Payment.findOne({ appointmentID: appointmentId })
      .populate('appointmentID')
      .populate('patientID', 'name email');
  }

  /**
   * Refund payment
   */
  static async refundPayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.paymentStatus !== 'paid') {
      throw new Error('Only paid payments can be refunded');
    }

    // Simulate refund process
    await new Promise(resolve => setTimeout(resolve, 1000));

    payment.paymentStatus = 'refunded';
    await payment.save();

    // Update appointment status
    await Appointment.findByIdAndUpdate(payment.appointmentID, {
      paymentStatus: 'refunded'
    });

    return payment;
  }
}

module.exports = PaymentService;