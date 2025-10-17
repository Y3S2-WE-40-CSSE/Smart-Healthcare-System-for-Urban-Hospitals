// models/paymentModel.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentID: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'PAY' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },
  appointmentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['govt_coverage', 'insurance', 'cash', 'card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'covered'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    sparse: true, // This allows multiple null values
    unique: true
  },
  gatewayResponse: {
    type: Object,
    default: {}
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  insuranceDetails: {
    provider: String,
    policyNumber: String,
    coverageAmount: Number
  },
  govtCoverageDetails: {
    scheme: String,
    referenceNumber: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate transactionId if it doesn't exist and payment is successful
  if (!this.transactionId && this.paymentStatus === 'paid') {
    this.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  
  // For government coverage, generate a coverage reference
  if (this.paymentMethod === 'govt_coverage' && !this.govtCoverageDetails.referenceNumber) {
    this.govtCoverageDetails.referenceNumber = `GOV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);