/**
 * Role Configuration Service
 * Manages role-based configurations and permissions
 * Following Single Responsibility and Open/Closed principles
 */
class RoleConfigService {
  /**
   * Defines which roles can be publicly registered
   * Modify this based on your security requirements
   */
  static PUBLIC_REGISTRATION_ROLES = ['patient', 'staff', 'doctor', 'admin'];

  /**
   * Defines which roles require admin creation
   */
  static ADMIN_ONLY_ROLES = ['administrator'];

  /**
   * Get role-specific field requirements
   * @param {String} role - User role
   * @returns {Object} - Required fields for the role
   */
  static getRoleRequirements(role) {
    const requirements = {
      patient: {
        required: ['name', 'email', 'password', 'contactInfo', 'DOB', 'address'],
        optional: ['nicNumber', 'allergies', 'medicalHistory'],
        fields: ['DOB', 'address', 'allergies', 'medicalHistory']
      },
      staff: {
        required: ['name', 'email', 'password', 'contactInfo', 'department'],
        optional: ['nicNumber'],
        fields: ['department']
      },
      doctor: {
        required: ['name', 'email', 'password', 'contactInfo', 'department', 'specialization', 'licenseNumber'],
        optional: ['nicNumber'],
        fields: ['department', 'specialization', 'licenseNumber']
      },
      admin: {
        required: ['name', 'email', 'password', 'contactInfo', 'department'],
        optional: ['nicNumber'],
        fields: ['department']
      },
      administrator: {
        required: ['name', 'email', 'password', 'contactInfo', 'department'],
        optional: [],
        fields: ['department']
      }
    };

    return requirements[role] || requirements.patient;
  }

  /**
   * Check if role can be publicly registered
   * @param {String} role - User role
   * @returns {Boolean}
   */
  static canPubliclyRegister(role) {
    return this.PUBLIC_REGISTRATION_ROLES.includes(role);
  }

  /**
   * Check if role requires admin creation
   * @param {String} role - User role
   * @returns {Boolean}
   */
  static requiresAdminCreation(role) {
    return this.ADMIN_ONLY_ROLES.includes(role);
  }

  /**
   * Get all allowed registration roles
   * @returns {Array} - List of allowed roles
   */
  static getPublicRoles() {
    return this.PUBLIC_REGISTRATION_ROLES;
  }

  /**
   * Validate role-specific fields
   * @param {String} role - User role
   * @param {Object} data - User data
   * @returns {Object} - { valid: boolean, missing: Array }
   */
  static validateRoleFields(role, data) {
    const requirements = this.getRoleRequirements(role);
    const missing = [];

    requirements.required.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        missing.push(field);
      }
    });

    return {
      valid: missing.length === 0,
      missing: missing
    };
  }
}

module.exports = RoleConfigService;
