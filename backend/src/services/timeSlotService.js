const Appointment = require('../models/appointmentModel');

class TimeSlotService {
  /**
   * Generate available time slots for a doctor on a specific date
   */
  static async getAvailableSlots(doctorId, date, duration = 30) {
    const startTime = new Date(date);
    startTime.setHours(9, 0, 0, 0); // Start at 9 AM
    
    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0); // End at 5 PM
    
    // Get existing appointments for this doctor on the selected date
    const existingAppointments = await Appointment.find({
      doctorID: doctorId,
      dateTime: {
        $gte: startTime,
        $lt: endTime
      },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('dateTime duration');

    // Generate all possible slots for the day
    const allSlots = this.generateTimeSlots(startTime, endTime, duration);
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => 
      !this.isSlotBooked(slot, existingAppointments, duration)
    );

    return availableSlots;
  }

  /**
   * Generate time slots for a given time range
   */
  static generateTimeSlots(startTime, endTime, duration) {
    const slots = [];
    const currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      slots.push(new Date(currentTime));
      currentTime.setMinutes(currentTime.getMinutes() + duration);
    }
    
    return slots;
  }

  /**
   * Check if a time slot is already booked
   */
  static isSlotBooked(slotTime, existingAppointments, duration) {
    const slotEnd = new Date(slotTime.getTime() + duration * 60000);
    
    return existingAppointments.some(apt => {
      const aptStart = new Date(apt.dateTime);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration || 30) * 60000);
      
      // Check for overlap
      return (slotTime < aptEnd && slotEnd > aptStart);
    });
  }

  /**
   * Validate if a time slot is available
   */
  static async validateTimeSlot(doctorId, dateTime, duration = 30) {
    const startTime = new Date(dateTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const conflictingAppointment = await Appointment.findOne({
      doctorID: doctorId,
      dateTime: {
        $lt: endTime
      },
      $expr: {
        $gt: [
          { $add: ["$dateTime", { $multiply: ["$duration", 60000] }] },
          startTime
        ]
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    return !conflictingAppointment;
  }

  /**
   * Get doctor's working hours
   */
  static getWorkingHours(date) {
    const day = new Date(date).getDay();
    
    // Monday to Friday: 9 AM - 5 PM
    // Saturday: 9 AM - 1 PM
    // Sunday: Closed
    if (day === 0) { // Sunday
      return null;
    } else if (day === 6) { // Saturday
      return {
        start: { hour: 9, minute: 0 },
        end: { hour: 13, minute: 0 }
      };
    } else {
      return {
        start: { hour: 9, minute: 0 },
        end: { hour: 17, minute: 0 }
      };
    }
  }
}

module.exports = TimeSlotService;