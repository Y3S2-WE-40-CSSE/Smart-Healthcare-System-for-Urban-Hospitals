const QRCode = require('qrcode');

/**
 * QRCodeService - Handles QR code and barcode generation
 * Follows Single Responsibility Principle
 */
class QRCodeService {
  /**
   * Generate QR code data URL
   * @param {Object} data - Data to encode in QR
   * @returns {Promise<String>} - QR code data URL
   */
  async generateQRCode(data) {
    try {
      const qrString = typeof data === 'object' ? JSON.stringify(data) : data;
      const qrDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 1
      });
      return { success: true, qrCode: qrDataURL };
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate barcode (Code128)
   * @param {String} data - Data to encode
   * @returns {String} - Barcode string
   */
  generateBarcode(data) {
    // Simple barcode format: prefix + timestamp + data
    const timestamp = Date.now();
    const barcode = `HC${timestamp}${data}`;
    return barcode;
  }

  /**
   * Create health card QR data
   * @param {Object} patient - Patient data
   * @param {Object} healthCard - Health card data
   * @returns {Object} - Structured QR data
   */
  createHealthCardQRData(patient, healthCard) {
    return {
      cardID: healthCard.cardID,
      patientID: patient._id.toString(),
      patientName: patient.name,
      DOB: patient.DOB,
      bloodGroup: patient.bloodGroup || 'Unknown',
      allergies: patient.allergies,
      emergencyContact: patient.contactInfo,
      issuedDate: healthCard.issuedDate,
      expiryDate: healthCard.expiryDate,
      type: 'DIGITAL_HEALTH_CARD',
      hospitalCode: process.env.HOSPITAL_CODE || 'SHS001'
    };
  }

  /**
   * Generate complete health card codes
   * @param {Object} patient - Patient data
   * @param {Object} healthCard - Health card data
   * @returns {Promise<Object>} - QR code and barcode
   */
  async generateHealthCardCodes(patient, healthCard) {
    const qrData = this.createHealthCardQRData(patient, healthCard);
    const qrCodeResult = await this.generateQRCode(qrData);
    const barcode = this.generateBarcode(healthCard.cardID);

    return {
      qrCode: qrCodeResult.success ? qrCodeResult.qrCode : null,
      qrData: qrData,
      barcode: barcode,
      success: qrCodeResult.success
    };
  }
}

module.exports = new QRCodeService();