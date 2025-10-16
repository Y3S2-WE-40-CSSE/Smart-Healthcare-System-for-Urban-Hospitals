const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'staff', 'doctor', 'admin', 'administrator'],
    default: 'patient'
  },
  contactInfo: {
    type: String,
    required: [true, 'Please provide contact information']
  },
  // Add this field to match the database
  nicNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  // Doctor/Staff specific fields
  department: {
    type: String,
    required: function() {
      return ['doctor', 'staff', 'admin'].includes(this.role);
    }
  },
  specialization: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    }
  },
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'doctor';
    },
    unique: true,
    sparse: true
  },
  // Patient specific fields
  DOB: {
    type: Date,
    required: function() {
      return this.role === 'patient';
    }
  },
  address: {
    type: String,
    required: function() {
      return this.role === 'patient';
    }
  },
  allergies: {
    type: String,
    default: 'None'
  },
  medicalHistory: {
    type: String,
    default: 'No significant medical history'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSelfRegistered: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // Only required if NOT self-registered
      return ['doctor', 'admin'].includes(this.role) && !this.isSelfRegistered;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user info without sensitive data
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);