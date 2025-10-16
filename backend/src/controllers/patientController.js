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

/**
 * @desc    Get all patients
 * @route   GET /api/patients
 * @access  Private (Staff, Doctor, Admin)
 */
const getAllPatients = async (req, res) => {
  try {
    const User = require('../models/userModel');
    
    // Get all users with role 'patient'
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 }); // Most recent first
    
    const response = ErrorHandlerService.createSuccessResponse(
      'Patients retrieved successfully',
      { patients, count: patients.length }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get All Patients');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Update patient details
 * @route   PUT /api/patients/:patientId
 * @access  Private (Staff, Doctor, Admin)
 */
const updatePatient = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const { patientId } = req.params;
    
    // Find patient
    const patient = await User.findById(patientId);
    
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'name', 'email', 'contactInfo', 'DOB', 'address', 
      'allergies', 'medicalHistory', 'bloodGroup', 
      'emergencyContact', 'gender', 'nicNumber'
    ];

    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    const response = ErrorHandlerService.createSuccessResponse(
      'Patient updated successfully',
      { patient: patient.getPublicProfile() }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Update Patient');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Delete patient
 * @route   DELETE /api/patients/:patientId
 * @access  Private (Staff, Admin)
 */
const deletePatient = async (req, res) => {
  try {
    const User = require('../models/userModel');
    const DigitalHealthCard = require('../models/digitalHealthCardModel');
    const { patientId } = req.params;
    
    // Find patient
    const patient = await User.findById(patientId);
    
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Delete associated health card if exists
    await DigitalHealthCard.findOneAndDelete({ patient: patientId });

    // Delete patient
    await User.findByIdAndDelete(patientId);

    res.status(200).json({
      success: true,
      message: 'Patient and associated records deleted successfully',
      data: {}
    });
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Delete Patient');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  registerPatient,
  getHealthCard,
  getAllPatients,
  updatePatient,
  deletePatient
};