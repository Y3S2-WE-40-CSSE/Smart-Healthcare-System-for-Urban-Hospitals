const PatientRepository = require('../repositories/patientRepository');
const HealthCardRepository = require('../repositories/healthCardRepository');
const QRCodeService = require('./qrCodeService');
const NotificationService = require('./notificationService');
const PatientValidator = require('../validators/patientValidator');
const PasswordUtils = require('../utils/passwordUtils');

/**
 * PatientRegistrationService - Orchestrates patient registration
 * Follows Single Responsibility Principle
 * Follows Dependency Inversion - Depends on repositories (abstractions)
 */
class PatientRegistrationService {
  constructor(patientRepo, healthCardRepo, qrService, notificationService) {
    this.patientRepo = patientRepo;
    this.healthCardRepo = healthCardRepo;
    this.qrService = qrService;
    this.notificationService = notificationService;
  }

  /**
   * Check if patient already exists
   * @param {String} email - Patient email
   * @param {String} nicNumber - Patient NIC
   * @returns {Promise<Object>} - Existence check result
   */
  async checkPatientExists(email, nicNumber) {
    const existingEmail = await this.patientRepo.findByEmail(email);
    if (existingEmail) {
      return {
        exists: true,
        field: 'email',
        message: 'A patient with this email already exists'
      };
    }

    if (nicNumber) {
      const existingNIC = await this.patientRepo.findByNIC(nicNumber);
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
   * Register new patient (Main workflow)
   * @param {Object} patientData - Patient information
   * @param {String} staffId - Staff member ID
   * @returns {Promise<Object>} - Registration result
   */
  async registerPatient(patientData, staffId) {
    try {
      // Step 1: Validate data
      const validation = PatientValidator.validate(patientData);
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

      // Step 3: Prepare patient data
      const temporaryPassword = PasswordUtils.generateTemporaryPassword();
      const preparedData = PatientValidator.prepareData(
        patientData, 
        staffId, 
        temporaryPassword
      );

      // Step 4: Create patient
      const patient = await this.patientRepo.create(preparedData);

      // Step 5: Create digital health card
      const healthCard = await this.createDigitalHealthCard(patient._id, staffId);

      // Step 6: Generate QR code and barcode
      const codes = await this.qrService.generateHealthCardCodes(patient, healthCard);
      
      // Step 7: Update health card with codes
      healthCard.QRCode = codes.qrCode;
      healthCard.barcode = codes.barcode;
      healthCard.barcodeImage = codes.barcodeImage;
      healthCard.qrData = codes.qrData;
      await healthCard.save();

      // Step 8: Send notifications asynchronously
      const healthCardData = {
        cardID: healthCard.cardID,
        QRCode: healthCard.QRCode,
        barcode: healthCard.barcode,
        barcodeImage: healthCard.barcodeImage,
        issuedDate: healthCard.issuedDate,
        expiryDate: healthCard.expiryDate,
        isActive: healthCard.isActive
      };

      console.log('📧 Preparing to send notification...');
      console.log('   QR Code exists:', !!healthCardData.QRCode);
      console.log('   QR Code starts with:', healthCardData.QRCode ? healthCardData.QRCode.substring(0, 30) : 'NULL');
      console.log('   Barcode Image exists:', !!healthCardData.barcodeImage);
      console.log('   Barcode Image starts with:', healthCardData.barcodeImage ? healthCardData.barcodeImage.substring(0, 30) : 'NULL');

      this.sendNotificationsAsync(patient, healthCardData);

      // Step 9: Return success response
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
          temporaryPassword: preparedData.password
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
    return await this.healthCardRepo.create({
      patientID: patientId,
      QRCode: 'PENDING',
      issuedBy: staffId,
      isActive: true
    });
  }

  /**
   * Send notifications asynchronously
   * @param {Object} patient - Patient data
   * @param {Object} healthCard - Health card data
   */
  async sendNotificationsAsync(patient, healthCard) {
    try {
      console.log('📧 Sending registration notifications...');
      console.log('   Patient:', patient.name);
      console.log('   Email:', patient.email);
      console.log('   Health Card ID:', healthCard.cardID);
      console.log('   QR Code included:', healthCard.QRCode ? 'Yes ✓' : 'No ✗');
      console.log('   Barcode included:', healthCard.barcode ? 'Yes ✓' : 'No ✗');
      
      const result = await this.notificationService.sendPatientRegistrationNotifications(
        patient, 
        healthCard
      );
      
      if (result.email.success) {
        console.log('✅ Email notification sent successfully');
      } else {
        console.log('⚠️ Email notification failed:', result.email.error || result.email.message);
      }
    } catch (error) {
      console.error('❌ Notification sending failed:', error);
    }
  }

  /**
   * Get patient health card
   * @param {String} patientId - Patient ID
   * @returns {Promise<Object>} - Health card data
   */
  async getPatientHealthCard(patientId) {
    try {
      const healthCard = await this.healthCardRepo.findByPatientId(patientId);

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

// Dependency Injection
module.exports = new PatientRegistrationService(
  PatientRepository,
  HealthCardRepository,
  QRCodeService,
  NotificationService
);