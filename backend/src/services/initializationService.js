const User = require('../models/userModel');

/**
 * InitializationService - Handles application initialization
 * Follows Single Responsibility Principle
 */
class InitializationService {
  /**
   * Initialize application defaults
   */
  async initialize() {
    await this.createSuperAdmin();
    // Add other initialization tasks here
  }

  /**
   * Create super admin if doesn't exist
   */
  async createSuperAdmin() {
    try {
      const superAdmin = await User.findOne({ role: 'administrator' });
      if (!superAdmin) {
        await User.create({
          name: 'Super Administrator',
          email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@hospital.com',
          password: process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
          role: 'administrator',
          contactInfo: 'System Administrator',
          department: 'Administration'
        });
        console.log('✅ Super Administrator created successfully');
      } else {
        console.log('ℹ️  Super Administrator already exists');
      }
    } catch (error) {
      console.error('❌ Error creating super admin:', error.message);
    }
  }
}

module.exports = new InitializationService();
