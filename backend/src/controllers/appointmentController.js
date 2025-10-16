const AppointmentService = require('../services/appointmentService');
const ErrorHandlerService = require('../services/errorHandlerService');
const ValidationService = require('../services/validationService');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    const { doctorID, department, dateTime, reason, notes } = req.body;

    // Validate appointment time
    AppointmentService.validateAppointmentTime(dateTime);

    // Check for scheduling conflicts
    const conflict = await AppointmentService.checkSchedulingConflict(doctorID, dateTime);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available at this time. Please choose another time.'
      });
    }

    // Create appointment
    const appointmentData = {
      patientID: req.user._id,
      doctorID,
      department,
      dateTime: new Date(dateTime),
      reason,
      notes,
      createdBy: req.user._id
    };

    const appointment = await AppointmentService.createAppointment(appointmentData);

    const response = ErrorHandlerService.createSuccessResponse(
      'Appointment scheduled successfully',
      { appointment }
    );

    res.status(201).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Create appointment');
    res.status(500).json(errorResponse);
  }
};

// @desc    Get appointments for current user
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    let appointments;
    
    if (req.user.role === 'patient') {
      appointments = await AppointmentService.getPatientAppointments(req.user._id);
    } else if (req.user.role === 'doctor') {
      appointments = await AppointmentService.getDoctorAppointments(req.user._id);
    } else {
      // Staff/Admin can see all appointments
      appointments = await AppointmentService.getAllAppointments();
    }

    const response = ErrorHandlerService.createSuccessResponse(
      'Appointments retrieved successfully',
      { appointments }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get appointments');
    res.status(500).json(errorResponse);
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentService.getPatientAppointments(req.user._id);

    const response = ErrorHandlerService.createSuccessResponse(
      'Your appointments retrieved successfully',
      { appointments }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get patient appointments');
    res.status(500).json(errorResponse);
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor)
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentService.getDoctorAppointments(req.user._id);

    const response = ErrorHandlerService.createSuccessResponse(
      'Doctor appointments retrieved successfully',
      { appointments }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get doctor appointments');
    res.status(500).json(errorResponse);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await AppointmentService.getAppointmentById(
      req.params.id, 
      req.user._id, 
      req.user.role
    );

    const response = ErrorHandlerService.createSuccessResponse(
      'Appointment retrieved successfully',
      { appointment }
    );

    res.status(200).json(response);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('Not authorized')) {
      return res.status(error.message.includes('Not authorized') ? 403 : 404).json({
        success: false,
        message: error.message
      });
    }
    const errorResponse = ErrorHandlerService.handleError(error, 'Get appointment');
    res.status(500).json(errorResponse);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    // Only allow certain fields to be updated based on role
    const allowedUpdates = {};
    if (req.user.role === 'patient') {
      if (req.body.reason) allowedUpdates.reason = req.body.reason;
      if (req.body.notes) allowedUpdates.notes = req.body.notes;
    } else if (['doctor', 'staff', 'admin'].includes(req.user.role)) {
      if (req.body.status) allowedUpdates.status = req.body.status;
      if (req.body.notes) allowedUpdates.notes = req.body.notes;
    }

    const appointment = await AppointmentService.updateAppointment(
      req.params.id, 
      allowedUpdates
    );

    const response = ErrorHandlerService.createSuccessResponse(
      'Appointment updated successfully',
      { appointment }
    );

    res.status(200).json(response);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    const errorResponse = ErrorHandlerService.handleError(error, 'Update appointment');
    res.status(500).json(errorResponse);
  }
};

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await AppointmentService.cancelAppointment(req.params.id);

    const response = ErrorHandlerService.createSuccessResponse(
      'Appointment cancelled successfully',
      { appointment }
    );

    res.status(200).json(response);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('already cancelled')) {
      return res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message
      });
    }
    const errorResponse = ErrorHandlerService.handleError(error, 'Cancel appointment');
    res.status(500).json(errorResponse);
  }
};

// @desc    Get available doctors
// @route   GET /api/appointments/doctors/available
// @access  Private
const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await AppointmentService.getAvailableDoctors();

    const response = ErrorHandlerService.createSuccessResponse(
      'Doctors retrieved successfully',
      { doctors }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get doctors');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getDoctorAppointments,
  getPatientAppointments,
  getAvailableDoctors
};