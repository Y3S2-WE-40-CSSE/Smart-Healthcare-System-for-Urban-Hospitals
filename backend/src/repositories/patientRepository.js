const User = require('../models/userModel');
const DigitalHealthCard = require('../models/digitalHealthCardModel');

/**
 * PatientRepository - Handles patient data access
 * Follows Single Responsibility Principle & Dependency Inversion
 */
class PatientRepository {
  /**
   * Find patient by email
   * @param {String} email - Patient email
   * @returns {Promise<Object|null>} - Patient or null
   */
  async findByEmail(email) {
    return await User.findOne({ email, role: 'patient' });
  }

  /**
   * Find patient by NIC number
   * @param {String} nicNumber - NIC number
   * @returns {Promise<Object|null>} - Patient or null
   */
  async findByNIC(nicNumber) {
    return await User.findOne({ nicNumber, role: 'patient' });
  }

  /**
   * Find patient by ID
   * @param {String} patientId - Patient ID
   * @returns {Promise<Object|null>} - Patient or null
   */
  async findById(patientId) {
    return await User.findById(patientId);
  }

  /**
   * Create new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} - Created patient
   */
  async create(patientData) {
    return await User.create(patientData);
  }

  /**
   * Update patient
   * @param {String} patientId - Patient ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated patient
   */
  async update(patientId, updateData) {
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      throw new Error('Patient not found');
    }

    Object.keys(updateData).forEach(key => {
      patient[key] = updateData[key];
    });

    await patient.save();
    return patient;
  }

  /**
   * Delete patient
   * @param {String} patientId - Patient ID
   * @returns {Promise<void>}
   */
  async delete(patientId) {
    await User.findByIdAndDelete(patientId);
  }

  /**
   * Get all patients
   * @returns {Promise<Array>} - List of patients
   */
  async findAll() {
    return await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });
  }
}

module.exports = new PatientRepository();