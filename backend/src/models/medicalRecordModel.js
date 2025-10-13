const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
  diagnosis: {
    type: String,
    required: [true, 'Please provide a diagnosis']
  },
  prescriptions: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  treatmentNotes: {
    type: String,
    required: [true, 'Please provide treatment notes']
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
