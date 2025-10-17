const MedicalRecord = require('../models/medicalRecordModel');

/**
 * MedicalRecordRepository - Handles medical record data access
 */
class MedicalRecordRepository {
  /**
   * Find all medical records for a patient
   */
  async findByPatientId(patientId) {
    return await MedicalRecord.find({ patientID: patientId })
      .populate('doctorID', 'name role department')
      .sort({ visitDate: -1 });
  }

  /**
   * Find a specific medical record by ID
   */
  async findById(recordId) {
    return await MedicalRecord.findById(recordId)
      .populate('patientID', 'name email DOB allergies bloodGroup medicalHistory')
      .populate('doctorID', 'name role department');
  }

  /**
   * Create a new medical record
   */
  async create(recordData) {
    return await MedicalRecord.create(recordData);
  }

  /**
   * Update a medical record
   */
  async update(recordId, updateData) {
    return await MedicalRecord.findByIdAndUpdate(
      recordId, 
      updateData, 
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a medical record
   */
  async delete(recordId) {
    return await MedicalRecord.findByIdAndDelete(recordId);
  }

  /**
   * Get recent medical records for a patient (last N records)
   */
  async getRecentRecords(patientId, limit = 10) {
    return await MedicalRecord.find({ patientID: patientId })
      .populate('doctorID', 'name role')
      .sort({ visitDate: -1 })
      .limit(limit);
  }
}

module.exports = new MedicalRecordRepository();