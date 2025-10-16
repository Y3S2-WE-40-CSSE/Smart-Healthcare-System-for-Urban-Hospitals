const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');

class AppointmentService {
  /**
   * Create new appointment
   */
  static async createAppointment(appointmentData) {
    const appointment = await Appointment.create(appointmentData);
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
   * Check for scheduling conflicts
   */
  static async checkSchedulingConflict(doctorId, dateTime) {
    const appointmentTime = new Date(dateTime);
    
    return await Appointment.findOne({
      doctorID: doctorId,
      dateTime: appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });
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