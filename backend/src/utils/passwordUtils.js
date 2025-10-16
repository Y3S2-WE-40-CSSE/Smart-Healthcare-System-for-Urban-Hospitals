const bcrypt = require('bcryptjs');

/**
 * PasswordUtils - Handles password operations
 * Follows Single Responsibility Principle
 */
class PasswordUtils {
  /**
   * Generate secure temporary password
   * @param {Number} length - Password length (default: 10)
   * @returns {String} - Generated password
   */
  static generateTemporaryPassword(length = 10) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Hash password
   * @param {String} password - Plain text password
   * @returns {Promise<String>} - Hashed password
   */
  static async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare password
   * @param {String} candidatePassword - Password to check
   * @param {String} hashedPassword - Hashed password
   * @returns {Promise<Boolean>} - Match result
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = PasswordUtils;