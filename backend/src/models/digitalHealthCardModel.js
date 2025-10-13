const mongoose = require('mongoose');

const digitalHealthCardSchema = new mongoose.Schema({
  cardID: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'HC' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  QRCode: {
    type: String,
    required: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 5); // 5 years validity
      return date;
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('DigitalHealthCard', digitalHealthCardSchema);
