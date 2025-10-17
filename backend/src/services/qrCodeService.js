const QRCode = require('qrcode');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');

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
      
      console.log('✅ QR Code generated, data URL length:', qrDataURL.length);
      return { success: true, qrCode: qrDataURL };
    } catch (error) {
      console.error('❌ QR Code generation failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate barcode string (simplified to card ID only)
   * @param {String} cardID - Health card ID
   * @returns {String} - Barcode string
   */
  generateBarcodeString(cardID) {
    // Use only the card ID for barcode (simpler and shorter)
    return cardID;
  }

  /**
   * Generate barcode image (Code128)
   * @param {String} data - Data to encode
   * @returns {String} - Barcode data URL
   */
  generateBarcodeImage(data) {
    try {
      // Ensure data is a string and not too long
      const barcodeData = String(data).substring(0, 20); // Limit to 20 characters for Code128
      
      const canvas = createCanvas(400, 120);
      
      JsBarcode(canvas, barcodeData, {
        format: 'CODE128',
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000'
      });

      const dataURL = canvas.toDataURL('image/png');
      console.log('✅ Barcode image generated, data URL length:', dataURL.length);
      console.log('   Barcode data:', barcodeData);
      
      return dataURL;
    } catch (error) {
      console.error('❌ Barcode generation failed:', error);
      console.error('   Error details:', error.message);
      return null;
    }
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
    console.log('🔧 Generating QR code and barcode for patient:', patient.name);
    console.log('   Card ID:', healthCard.cardID);
    
    const qrData = this.createHealthCardQRData(patient, healthCard);
    const qrCodeResult = await this.generateQRCode(qrData);
    
    // Generate barcode string (just the card ID)
    const barcodeString = this.generateBarcodeString(healthCard.cardID);
    
    // Generate barcode image
    const barcodeImage = this.generateBarcodeImage(barcodeString);

    if (qrCodeResult.success) {
      console.log('✅ QR code generated successfully');
      console.log('✅ Barcode string:', barcodeString);
      console.log('✅ Barcode image generated:', barcodeImage ? 'Yes' : 'No');
      
      if (barcodeImage) {
        console.log('   Barcode starts with:', barcodeImage.substring(0, 30) + '...');
      }
    } else {
      console.error('❌ QR code generation failed:', qrCodeResult.error);
    }

    return {
      qrCode: qrCodeResult.success ? qrCodeResult.qrCode : null,
      qrData: qrData,
      barcode: barcodeString,
      barcodeImage: barcodeImage,
      success: qrCodeResult.success
    };
  }
}

module.exports = new QRCodeService();