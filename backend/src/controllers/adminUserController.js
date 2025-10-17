const UserManagementService = require('../services/userManagementService');
const ValidationService = require('../services/validationService');
const ErrorHandlerService = require('../services/errorHandlerService');

/**
 * AdminUserController - Handles administrative user creation
 * Follows Single Responsibility Principle - Only handles admin operations
 */

// @desc    Create doctor (Admin only)
// @route   POST /api/admin/create-doctor
// @access  Private (Admin only)
const createDoctor = async (req, res) => {
  try {
    // Validate request
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    // Delegate to service layer
    const result = await UserManagementService.createUserByAdmin(
      req.body,
      'doctor',
      req.user._id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors || [],
        errorsByField: result.errorsByField || {}
      });
    }

    const response = ErrorHandlerService.createSuccessResponse(
      'Doctor created successfully',
      { doctor: result.data }
    );

    res.status(201).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Create doctor');
    res.status(500).json(errorResponse);
  }
};

// @desc    Create administrator (Super Admin only)
// @route   POST /api/superadmin/create-admin
// @access  Private (Administrator only)
const createAdmin = async (req, res) => {
  try {
    // Validate request
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    // Delegate to service layer
    const result = await UserManagementService.createUserByAdmin(
      req.body,
      'admin',
      req.user._id
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors || [],
        errorsByField: result.errorsByField || {}
      });
    }

    const response = ErrorHandlerService.createSuccessResponse(
      'Administrator created successfully',
      { admin: result.data }
    );

    res.status(201).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Create admin');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  createDoctor,
  createAdmin
};
