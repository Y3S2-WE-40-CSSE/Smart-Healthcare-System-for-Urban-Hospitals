// services/appointmentService.js
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const TimeSlotService = require('./timeSlotService');

class AppointmentService {
  /**
   * Create new appointment with time slot validation
   */
  static async createAppointment(appointmentData) {
    const { doctorID, dateTime, duration = 30 } = appointmentData;
    
    // Validate time slot availability
    const isSlotAvailable = await TimeSlotService.validateTimeSlot(
      doctorID, 
      dateTime, 
      duration
    );
    
    if (!isSlotAvailable) {
      throw new Error('The selected time slot is no longer available. Please choose another time.');
    }

    // Validate working hours
    const workingHours = TimeSlotService.getWorkingHours(dateTime);
    if (!workingHours) {
      throw new Error('Appointments are not available on Sundays.');
    }

    const appointmentHour = new Date(dateTime).getHours();
    const appointmentMinute = new Date(dateTime).getMinutes();
    
    if (appointmentHour < workingHours.start.hour || 
        (appointmentHour === workingHours.end.hour && appointmentMinute >= workingHours.end.minute) ||
        appointmentHour > workingHours.end.hour) {
      throw new Error(`Appointments are only available between ${workingHours.start.hour}:00 and ${workingHours.end.hour}:00`);
    }

    const appointment = await Appointment.create({
      ...appointmentData,
      duration: duration
    });
    
    return await appointment.populate([
      { path: 'patientID', select: 'name contactInfo' },
      { path: 'doctorID', select: 'name specialization department' }
    ]);
  }

  /**
   * Get appointments by patient ID
   */
  static async getPatientAppointments(patientId) {
    return await Appointment.find({ patientID: patientId })
      .populate('doctorID', 'name specialization department contactInfo')
      .sort({ dateTime: -1 });
  }

  /**
   * Get appointments by doctor ID
   */
  static async getDoctorAppointments(doctorId) {
    return await Appointment.find({ doctorID: doctorId })
      .populate('patientID', 'name contactInfo DOB allergies medicalHistory')
      .sort({ dateTime: -1 });
  }

  /**
   * Get all appointments (for staff/admin)
   */
  static async getAllAppointments() {
    return await Appointment.find()
      .populate('patientID', 'name contactInfo')
      .populate('doctorID', 'name specialization department')
      .sort({ dateTime: -1 });
  }

  /**
   * Get appointment by ID with authorization check
   */
  static async getAppointmentById(appointmentId, userId, userRole) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientID', 'name contactInfo DOB allergies medicalHistory')
      .populate('doctorID', 'name specialization department contactInfo');

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Authorization check
    if (userRole === 'patient' && appointment.patientID._id.toString() !== userId.toString()) {
      throw new Error('Not authorized to view this appointment');
    }

    if (userRole === 'doctor' && appointment.doctorID._id.toString() !== userId.toString()) {
      throw new Error('Not authorized to view this appointment');
    }

    return appointment;
  }

  /**
   * Check for scheduling conflicts (legacy method - now using TimeSlotService)
   */
  static async checkSchedulingConflict(doctorId, dateTime) {
    return !(await TimeSlotService.validateTimeSlot(doctorId, dateTime, 30));
  }

  /**
   * Update appointment
   */
  static async updateAppointment(appointmentId, updateData) {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientID', 'name contactInfo').populate('doctorID', 'name specialization');

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(appointmentId) {
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status === 'cancelled') {
      throw new Error('Appointment is already cancelled');
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return appointment;
  }

  /**
   * Validate appointment time (must be in future)
   */
  static validateAppointmentTime(dateTime) {
    const appointmentTime = new Date(dateTime);
    if (appointmentTime <= new Date()) {
      throw new Error('Appointment time must be in the future');
    }
    return true;
  }

  /**
   * Get available doctors
   */
  static async getAvailableDoctors() {
    return await User.find({ role: 'doctor', isActive: true })
      .select('name specialization department contactInfo licenseNumber')
      .sort({ name: 1 });
  }

  /**
   * Get available time slots for a doctor
   */
  static async getAvailableTimeSlots(doctorId, date, duration = 30) {
    return await TimeSlotService.getAvailableSlots(doctorId, date, duration);
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(doctorId = null) {
    const matchStage = doctorId ? { doctorID: doctorId } : {};
    
    const stats = await Appointment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    return stats;
  }
}

module.exports = AppointmentService;