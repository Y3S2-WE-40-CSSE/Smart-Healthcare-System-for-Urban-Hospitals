// models/appointmentModel.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentID: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'APT' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true,
    validate: {
      validator: function(dateTime) {
        // Validate working hours (9 AM - 5 PM)
        const hour = dateTime.getHours();
        const minute = dateTime.getMinutes();
        const day = dateTime.getDay();
        
        // Sunday closed
        if (day === 0) return false;
        
        // Saturday: 9 AM - 1 PM
        if (day === 6) {
          return hour >= 9 && (hour < 13 || (hour === 13 && minute === 0));
        }
        
        // Weekdays: 9 AM - 5 PM
        return hour >= 9 && hour < 17;
      },
      message: 'Appointments must be scheduled during working hours (Mon-Fri: 9AM-5PM, Sat: 9AM-1PM)'
    }
  },
  duration: {
    type: Number,
    default: 30, // 30 minutes default
    enum: [15, 30, 45, 60]
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['govt_coverage', 'insurance', 'cash', 'card', 'none'],
    default: 'none'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);