const { validationResult } = require('express-validator');

class ValidationService {
  /**
   * Checks for validation errors and formats them
   * @param {Object} req - Express request object
   * @returns {Object} - { hasErrors: boolean, errors: Array }
   */
  static validateRequest(req) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.param || error.path, // Handle both param and path
        message: error.msg,
        value: error.value,
        location: error.location
      }));

      return {
        hasErrors: true,
        errors: formattedErrors
      };
    }

    return {
      hasErrors: false,
      errors: []
    };
  }

  /**
   * Creates validation error response
   * @param {Array} errors - Array of validation errors
   * @returns {Object} - Formatted error response
   */
  static createValidationErrorResponse(errors) {
    // Group errors by field for better UX
    const errorsByField = errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {});

    return {
      success: false,
      message: 'Validation errors occurred',
      errors: errors,
      errorsByField: errorsByField
    };
  }
}

module.exports = ValidationService;
