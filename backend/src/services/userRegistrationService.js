const User = require('../models/userModel');
const DigitalHealthCard = require('../models/digitalHealthCardModel');
const RoleConfigService = require('./roleConfigService');

class UserRegistrationService {
  /**
   * Validates if user already exists
   * @param {String} email - User email
   * @param {String} nicNumber - User NIC number
   * @returns {Object} - { exists: boolean, field: string, message: string }
   */
  static async checkUserExists(email, nicNumber) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        exists: true,
        field: 'email',
        message: 'User already exists with this email'
      };
    }

    if (nicNumber) {
      const existingNIC = await User.findOne({ nicNumber });
      if (existingNIC) {
        return {
          exists: true,
          field: 'nicNumber',
          message: 'User with this NIC number already exists'
        };
      }
    }

    return { exists: false };
  }

  /**
   * Check if license number already exists
   * @param {String} licenseNumber - Doctor's license number
   * @returns {Object} - { exists: boolean, message: string }
   */
  static async checkLicenseExists(licenseNumber) {
    if (!licenseNumber) {
      return { exists: false };
    }

    const existingLicense = await User.findOne({ licenseNumber });
    if (existingLicense) {
      return {
        exists: true,
        field: 'licenseNumber',
        message: 'Doctor with this license number already exists'
      };
    }

    return { exists: false };
  }

  /**
   * Validates role for public registration using RoleConfigService
   * @param {String} role - User role
   * @returns {Object} - { valid: boolean, message: string }
   */
  static validatePublicRole(role) {
    if (!role) {
      return { valid: true }; // Will default to patient
    }

    if (!RoleConfigService.canPubliclyRegister(role)) {
      const allowedRoles = RoleConfigService.getPublicRoles().join(', ');
      return {
        valid: false,
        message: `Invalid role for public registration. Allowed roles: ${allowedRoles}`
      };
    }

    return { valid: true };
  }

  /**
   * Validates role-specific required fields
   * @param {String} role - User role
   * @param {Object} data - Request data
   * @returns {Object} - { valid: boolean, errors: Array }
   */
  static validateRoleSpecificFields(role, data) {
    const validation = RoleConfigService.validateRoleFields(role, data);
    
    if (!validation.valid) {
      const errors = validation.missing.map(field => ({
        field: field,
        message: `${field} is required for ${role}`
      }));

      return {
        valid: false,
        errors: errors
      };
    }

    return { valid: true, errors: [] };
  }

  /**
   * Prepares user data based on role
   * @param {Object} requestData - Request body data
   * @returns {Object} - Formatted user data
   */
  static prepareUserData(requestData) {
    const {
      name,
      email,
      password,
      role,
      contactInfo,
      nicNumber,
      department,
      specialization,
      licenseNumber,
      DOB,
      address,
      allergies,
      medicalHistory
    } = requestData;

    const userData = {
      name,
      email,
      password,
      role: role || 'patient',
      contactInfo,
      nicNumber: nicNumber || `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isSelfRegistered: true  // Mark as self-registered for public registration
    };

    // Add role-specific fields based on role
    switch (userData.role) {
      case 'patient':
        userData.DOB = DOB;
        userData.address = address;
        userData.allergies = allergies || 'None';
        userData.medicalHistory = medicalHistory || 'No significant medical history';
        break;

      case 'staff':
        userData.department = department;
        break;

      case 'doctor':
        userData.department = department;
        userData.specialization = specialization;
        userData.licenseNumber = licenseNumber;
        break;

      case 'admin':
        userData.department = department;
        break;

      default:
        // Default to patient fields
        userData.DOB = DOB;
        userData.address = address;
        userData.allergies = allergies || 'None';
        userData.medicalHistory = medicalHistory || 'No significant medical history';
    }

    return userData;
  }

  /**
   * Creates a new user
   * @param {Object} userData - User data to create
   * @returns {Object} - Created user
   */
  static async createUser(userData) {
    const user = await User.create(userData);
    return user;
  }

  /**
   * Creates digital health card for patient
   * @param {String} userId - Patient user ID
   * @returns {Object} - Created health card
   */
  static async createHealthCard(userId) {
    const healthCard = await DigitalHealthCard.create({
      patientID: userId,
      QRCode: `QR_${userId}_${Date.now()}`,
      issuedBy: userId
    });
    return healthCard;
  }
}

module.exports = UserRegistrationService;