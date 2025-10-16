class ErrorHandlerService {
    /**
     * Handles different types of errors uniformly
     * @param {Error} error - The error object
     * @param {String} context - Context where error occurred
     * @returns {Object} - Formatted error response
     */
    static handleError(error, context = 'Operation') {
      console.error(`${context} error:`, error);
  
      // Mongoose validation error
      if (error.name === 'ValidationError') {
        const errors = Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }));
  
        return {
          success: false,
          message: 'Validation failed',
          errors: errors,
          errorsByField: errors.reduce((acc, err) => {
            acc[err.field] = err.message;
            return acc;
          }, {})
        };
      }
  
      // Mongoose duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return {
          success: false,
          message: `${field} already exists`,
          errors: [{
            field: field,
            message: `This ${field} is already registered`
          }],
          errorsByField: {
            [field]: `This ${field} is already registered`
          }
        };
      }
  
      // Mongoose cast error
      if (error.name === 'CastError') {
        return {
          success: false,
          message: 'Invalid data format',
          errors: [{
            field: error.path,
            message: `Invalid ${error.path}`
          }]
        };
      }
  
      // Generic error
      return {
        success: false,
        message: error.message || `Server error during ${context.toLowerCase()}`,
        errors: []
      };
    }
  
    /**
     * Creates a success response
     * @param {String} message - Success message
     * @param {Object} data - Response data
     * @returns {Object} - Formatted success response
     */
    static createSuccessResponse(message, data = {}) {
      return {
        success: true,
        message: message,
        data: data
      };
    }
  }
  
  module.exports = ErrorHandlerService;


