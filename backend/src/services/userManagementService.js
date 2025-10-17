const User = require('../models/userModel');

/**
 * UserManagementService - Handles user creation by admins
 * Follows Single Responsibility & DRY principles
 */
class UserManagementService {
  /**
   * Create user by admin (Doctor or Admin)
   * @param {Object} userData - User data
   * @param {String} role - 'doctor' or 'admin'
   * @param {String} creatorId - Admin ID
   * @returns {Promise<Object>} - Result object
   */
  async createUserByAdmin(userData, role, creatorId) {
    try {
      const { 
        name, 
        email, 
        password, 
        contactInfo,
        department,
        specialization,
        licenseNumber
      } = userData;

      // Check if user exists by email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email',
          errors: [{
            field: 'email',
            message: 'User already exists with this email'
          }],
          errorsByField: {
            email: 'User already exists with this email'
          }
        };
      }

      // Check license number for doctors
      if (role === 'doctor' && licenseNumber) {
        const existingLicense = await User.findOne({ licenseNumber });
        if (existingLicense) {
          return {
            success: false,
            message: 'Doctor with this license number already exists',
            errors: [{
              field: 'licenseNumber',
              message: 'Doctor with this license number already exists'
            }],
            errorsByField: {
              licenseNumber: 'Doctor with this license number already exists'
            }
          };
        }
      }

      // Prepare user data
      const newUserData = {
        name,
        email,
        password,
        role,
        contactInfo,
        department,
        createdBy: creatorId,
        isSelfRegistered: false
      };

      // Add role-specific fields
      if (role === 'doctor') {
        newUserData.specialization = specialization;
        newUserData.licenseNumber = licenseNumber;
      }

      // Create user
      const user = await User.create(newUserData);

      return {
        success: true,
        data: user.getPublicProfile()
      };
    } catch (error) {
      return {
        success: false,
        message: 'User creation failed',
        error: error.message
      };
    }
  }
}

module.exports = new UserManagementService();
