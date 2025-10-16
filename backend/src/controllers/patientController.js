const PatientRegistrationService = require('../services/patientRegistrationService');
const ValidationService = require('../services/validationService');
const ErrorHandlerService = require('../services/errorHandlerService');

/**
 * PatientController - Handles patient-related HTTP requests
 * Follows Single Responsibility Principle
 */

/**
 * @desc    Register new patient (Staff only)
 * @route   POST /api/patients/register
 * @access  Private (Staff, Doctor, Admin)
 */
const registerPatient = async (req, res) => {
  try {
    // Validate request
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    // Register patient
    const staffId = req.user._id;
    const result = await PatientRegistrationService.registerPatient(req.body, staffId);

    if (!result.success) {
      const errorsByField = result.errors ? result.errors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {}) : {};

      return res.status(400).json({
        success: false,
        message: result.message,
        errors: result.errors || [],
        errorsByField: errorsByField
      });
    }

    // Success response
    const response = ErrorHandlerService.createSuccessResponse(
      result.message,
      result.data
    );

    res.status(201).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Patient Registration');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Get patient health card
 * @route   GET /api/patients/:patientId/health-card
 * @access  Private (Staff, Doctor, Patient-own)
 */
const getHealthCard = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Authorization check: Staff/Doctor can access any, Patient can only access own
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this health card'
      });
    }

    const result = await PatientRegistrationService.getPatientHealthCard(patientId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }

    const response = ErrorHandlerService.createSuccessResponse(
      'Health card retrieved successfully',
      result.data
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Health Card');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  registerPatient,
  getHealthCard
};