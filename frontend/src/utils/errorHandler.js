/**
 * Extracts and formats validation errors from API response
 * @param {Object} errorResponse - Error response from API
 * @returns {Object} - Formatted errors object
 */
export const extractValidationErrors = (errorResponse) => {
  console.log('🔍 Extracting errors from:', errorResponse); // DEBUG LOG
  
  const formattedErrors = {};

  // Check if errorsByField exists (new format)
  if (errorResponse.errorsByField) {
    console.log('✅ Found errorsByField:', errorResponse.errorsByField);
    return errorResponse.errorsByField;
  }

  // Fallback: Parse errors array
  if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
    console.log('📋 Processing errors array:', errorResponse.errors);
    errorResponse.errors.forEach(error => {
      const field = error.field || error.param || error.path;
      const message = error.message || error.msg;
      
      if (field && message) {
        formattedErrors[field] = message;
      }
    });
  }

  console.log('🎯 Final formatted errors:', formattedErrors);
  return formattedErrors;
};

/**
 * Formats error message for display
 * @param {Object} errorResponse - Error response from API
 * @returns {String} - Formatted error message
 */
export const formatErrorMessage = (errorResponse) => {
  if (errorResponse.message) {
    return errorResponse.message;
  }

  if (errorResponse.errors && errorResponse.errors.length > 0) {
    return errorResponse.errors[0].message || errorResponse.errors[0].msg || 'An error occurred';
  }

  return 'An unexpected error occurred';
};

/**
 * Validates form data on client side
 * @param {Object} formData - Form data to validate
 * @param {String} formType - Type of form ('register', 'login', etc.)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateFormData = (formData, formType = 'register') => {
  const errors = {};

  if (formType === 'register') {
    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Please provide a valid email address';
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Contact info validation
    if (!formData.contactInfo || formData.contactInfo.trim().length < 10) {
      errors.contactInfo = 'Please provide valid contact information (at least 10 characters)';
    }

    // Role-specific validations
    if (formData.role === 'patient') {
      if (!formData.DOB) {
        errors.DOB = 'Date of birth is required';
      }
      if (!formData.address || formData.address.trim().length < 5) {
        errors.address = 'Please provide a valid address';
      }
    }

    if (formData.role === 'staff') {
      if (!formData.department || formData.department.trim().length < 2) {
        errors.department = 'Department is required for staff';
      }
    }

    // ⭐ ADD DOCTOR VALIDATIONS
    if (formData.role === 'doctor') {
      if (!formData.department || formData.department.trim().length < 2) {
        errors.department = 'Department is required for doctors';
      }
      if (!formData.specialization || formData.specialization.trim().length < 2) {
        errors.specialization = 'Specialization is required for doctors';
      }
      if (!formData.licenseNumber || formData.licenseNumber.trim().length < 3) {
        errors.licenseNumber = 'License number is required for doctors';
      }
    }

    // ⭐ ADD ADMIN VALIDATIONS
    if (formData.role === 'admin') {
      if (!formData.department || formData.department.trim().length < 2) {
        errors.department = 'Department is required for administrators';
      }
    }
  }

  console.log('🔍 Client validation result:', { isValid: Object.keys(errors).length === 0, errors });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
