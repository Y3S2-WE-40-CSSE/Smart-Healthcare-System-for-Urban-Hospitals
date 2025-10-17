const MedicalRecordService = require('../services/medicalRecordService');
const ErrorHandlerService = require('../services/errorHandlerService');

/**
 * MedicalRecordController - Handles medical record HTTP requests
 */

/**
 * @desc    Scan health card and retrieve patient info
 * @route   POST /api/medical-records/scan
 * @access  Private (Doctor, Staff)
 */
const scanHealthCard = async (req, res) => {
  try {
    const { cardID } = req.body;

    if (!cardID) {
      return res.status(400).json({
        success: false,
        message: 'Card ID is required'
      });
    }

    const result = await MedicalRecordService.verifyHealthCard(cardID);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const response = ErrorHandlerService.createSuccessResponse(
      result.message,
      result.data
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Scan Health Card');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Get patient's medical history
 * @route   GET /api/medical-records/patient/:patientId
 * @access  Private (Doctor, Staff)
 */
const getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await MedicalRecordService.getPatientMedicalHistory(patientId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const response = ErrorHandlerService.createSuccessResponse(
      result.message,
      result.data
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Medical History');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Add new visit/medical record
 * @route   POST /api/medical-records
 * @access  Private (Doctor)
 */
const addVisitRecord = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const result = await MedicalRecordService.addVisitRecord(req.body, doctorId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    const response = ErrorHandlerService.createSuccessResponse(
      result.message,
      result.data
    );

    res.status(201).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Add Visit Record');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Search patient by NIC (manual fallback)
 * @route   GET /api/medical-records/search/:nicNumber
 * @access  Private (Doctor, Staff)
 */
const searchPatientByNIC = async (req, res) => {
  try {
    const { nicNumber } = req.params;

    const result = await MedicalRecordService.searchPatientByNIC(nicNumber);

    if (!result.success) {
      return res.status(404).json(result);
    }

    const response = ErrorHandlerService.createSuccessResponse(
      result.message,
      result.data
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Search Patient');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  scanHealthCard,
  getPatientMedicalHistory,
  addVisitRecord,
  searchPatientByNIC
};