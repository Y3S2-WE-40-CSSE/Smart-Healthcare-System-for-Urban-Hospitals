const DigitalHealthCard = require('../models/digitalHealthCardModel');

/**
 * HealthCardRepository - Handles health card data access
 * Follows Single Responsibility Principle
 */
class HealthCardRepository {
  /**
   * Create new health card
   * @param {Object} cardData - Health card data
   * @returns {Promise<Object>} - Created health card
   */
  async create(cardData) {
    return await DigitalHealthCard.create(cardData);
  }

  /**
   * Find health card by patient ID
   * @param {String} patientId - Patient ID
   * @returns {Promise<Object|null>} - Health card or null
   */
  async findByPatientId(patientId) {
    return await DigitalHealthCard.findOne({ patientID: patientId })
      .populate('patientID', 'name email DOB contactInfo allergies bloodGroup')
      .populate('issuedBy', 'name role department');
  }

  /**
   * Update health card
   * @param {String} cardId - Card ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} - Updated health card
   */
  async update(cardId, updateData) {
    return await DigitalHealthCard.findByIdAndUpdate(
      cardId, 
      updateData, 
      { new: true }
    );
  }

  /**
   * Delete health card by patient ID
   * @param {String} patientId - Patient ID
   * @returns {Promise<void>}
   */
  async deleteByPatientId(patientId) {
    await DigitalHealthCard.findOneAndDelete({ patientID: patientId });
  }
}

module.exports = new HealthCardRepository();