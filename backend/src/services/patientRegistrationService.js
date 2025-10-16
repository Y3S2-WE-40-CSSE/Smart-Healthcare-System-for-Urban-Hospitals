const User = require('../models/userModel');
const DigitalHealthCard = require('../models/digitalHealthCardModel');
const QRCodeService = require('./qrCodeService');
const NotificationService = require('./notificationService');
const ValidationService = require('./validationService');

/**
 * PatientRegistrationService - Handles staff-initiated patient registration
 * Follows Single Responsibility Principle - Only handles patient registration logic
 * Follows Open/Closed Principle - Extensible without modification
 * Follows Dependency Inversion - Depends on abstractions (services)
 */
class PatientRegistrationService {
  /**
   * Validate patient registration data
   * @param {Object} patientData - Patient information
   * @returns {Object} - Validation result
   */
  validatePatientData(patientData) {
    const errors = [];

    // Required fields for patients
    const requiredFields = ['name', 'email', 'contactInfo', 'DOB', 'address'];
    
    requiredFields.forEach(field => {
      if (!patientData[field] || patientData[field].toString().trim() === '') {
        errors.push({
          field: field,
          message: `${field} is required`
        });
      }
    });

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (patientData.email && !emailRegex.test(patientData.email)) {
      errors.push({
        field: 'email',
        message: 'Please provide a valid email address'
      });
    }

    // DOB validation (must be in the past)
    if (patientData.DOB) {
      const dob = new Date(patientData.DOB);
      if (dob >= new Date()) {
        errors.push({
          field: 'DOB',
          message: 'Date of birth must be in the past'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Check if patient already exists
   * @param {String} email - Patient email
   * @param {String} nicNumber - Patient NIC
   * @returns {Promise<Object>} - Existence check result
   */
  async checkPatientExists(email, nicNumber) {
    const existingEmail = await User.findOne({ email, role: 'patient' });
    if (existingEmail) {
      return {
        exists: true,
        field: 'email',
        message: 'A patient with this email already exists'
      };
    }

    if (nicNumber) {
      const existingNIC = await User.findOne({ nicNumber, role: 'patient' });
      if (existingNIC) {
        return {
          exists: true,
          field: 'nicNumber',
          message: 'A patient with this NIC number already exists'
        };
      }
    }

    return { exists: false };
  }

  /**
   * Prepare patient data for creation
   * @param {Object} requestData - Raw request data
   * @param {String} staffId - Staff member who is registering the patient
   * @returns {Object} - Formatted patient data
   */
  preparePatientData(requestData, staffId) {
    const {
      name,
      email,
      contactInfo,
      nicNumber,
      DOB,
      address,
      allergies,
      medicalHistory,
      bloodGroup,
      emergencyContact,
      gender
    } = requestData;

    return {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: this.generateTemporaryPassword(),
      role: 'patient',
      contactInfo: contactInfo.trim(),
      nicNumber: nicNumber || `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      DOB: new Date(DOB),
      address: address.trim(),
      allergies: allergies || 'None',
      medicalHistory: medicalHistory || 'No significant medical history',
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: emergencyContact || contactInfo,
      gender: gender || 'Not specified',
      isSelfRegistered: false,
      createdBy: staffId,
      isActive: true
    };
  }

  /**
   * Generate temporary password for patient
   * @returns {String} - Temporary password
   */
  generateTemporaryPassword() {
    // Generate a secure temporary password
    const length = 10;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Register new patient (Main workflow)
   * @param {Object} patientData - Patient information
   * @param {String} staffId - Staff member ID
   * @returns {Promise<Object>} - Registration result
   */
  async registerPatient(patientData, staffId) {
    try {
      // Step 1: Validate data
      const validation = this.validatePatientData(patientData);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      // Step 2: Check if patient exists
      const existenceCheck = await this.checkPatientExists(
        patientData.email,
        patientData.nicNumber
      );
      if (existenceCheck.exists) {
        return {
          success: false,
          message: existenceCheck.message,
          errors: [{
            field: existenceCheck.field,
            message: existenceCheck.message
          }]
        };
      }

      // Step 3: Prepare and create patient
      const preparedData = this.preparePatientData(patientData, staffId);
      const patient = await User.create(preparedData);

      // Step 4: Create digital health card
      const healthCard = await this.createDigitalHealthCard(patient._id, staffId);

      // Step 5: Generate QR code and barcode
      const codes = await QRCodeService.generateHealthCardCodes(patient, healthCard);
      
      // Update health card with QR code and barcode
      healthCard.QRCode = codes.qrCode;
      healthCard.barcode = codes.barcode;
      healthCard.qrData = codes.qrData;
      await healthCard.save();

      // Step 6: Send notifications (async, don't wait)
      this.sendNotificationsAsync(patient, healthCard);

      // Step 7: Return success response
      return {
        success: true,
        message: 'Patient registered successfully',
        data: {
          patient: patient.getPublicProfile(),
          healthCard: {
            cardID: healthCard.cardID,
            qrCode: healthCard.QRCode,
            barcode: healthCard.barcode,
            issuedDate: healthCard.issuedDate,
            expiryDate: healthCard.expiryDate
          },
          temporaryPassword: preparedData.password // Send this to staff, not to patient
        }
      };
    } catch (error) {
      console.error('Patient registration failed:', error);
      return {
        success: false,
        message: 'Patient registration failed',
        error: error.message
      };
    }
  }

  /**
   * Create digital health card for patient
   * @param {String} patientId - Patient user ID
   * @param {String} staffId - Staff member ID
   * @returns {Promise<Object>} - Created health card
   */
  async createDigitalHealthCard(patientId, staffId) {
    const healthCard = await DigitalHealthCard.create({
      patientID: patientId,
      QRCode: 'PENDING', // Will be updated later
      issuedBy: staffId,
      isActive: true
    });
    return healthCard;
  }

  /**
   * Send notifications asynchronously
   * @param {Object} patient - Patient data
   * @param {Object} healthCard - Health card data
   */
  async sendNotificationsAsync(patient, healthCard) {
    try {
      await NotificationService.sendPatientRegistrationNotifications(patient, healthCard);
    } catch (error) {
      console.error('Notification sending failed:', error);
      // Don't throw error - notifications are non-critical
    }
  }

  /**
   * Get patient health card
   * @param {String} patientId - Patient ID
   * @returns {Promise<Object>} - Health card data
   */
  async getPatientHealthCard(patientId) {
    try {
      const healthCard = await DigitalHealthCard.findOne({ patientID: patientId })
        .populate('patientID', 'name email DOB contactInfo allergies bloodGroup')
        .populate('issuedBy', 'name role department');

      if (!healthCard) {
        return {
          success: false,
          message: 'Health card not found'
        };
      }

      return {
        success: true,
        data: healthCard
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve health card',
        error: error.message
      };
    }
  }
}

module.exports = new PatientRegistrationService();