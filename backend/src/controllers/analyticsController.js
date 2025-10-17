const Appointment = require('../models/appointmentModel');
const MedicalRecord = require('../models/medicalRecordModel');
const User = require('../models/userModel');
const ErrorHandlerService = require('../services/errorHandlerService');

/**
 * @desc    Get patient flow statistics
 * @route   GET /api/analytics/patient-flow
 * @access  Private (Admin, Administrator)
 */
const getPatientFlowStats = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    // Build query filter
    const filter = {};
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (department) {
      filter.department = department;
    }

    // Get appointments within date range
    const appointments = await Appointment.find(filter)
      .populate('patientID', 'name')
      .populate('doctorID', 'name specialization');

    // Calculate statistics
    const totalVisits = appointments.length;
    const completedVisits = appointments.filter(a => a.status === 'completed').length;
    const cancelledVisits = appointments.filter(a => a.status === 'cancelled').length;
    const noShowVisits = appointments.filter(a => a.status === 'no-show').length;

    // Group by date for trend analysis
    const visitsByDate = appointments.reduce((acc, appointment) => {
      const date = appointment.appointmentDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Group by department
    const visitsByDepartment = appointments.reduce((acc, appointment) => {
      acc[appointment.department] = (acc[appointment.department] || 0) + 1;
      return acc;
    }, {});

    const response = ErrorHandlerService.createSuccessResponse(
      'Patient flow statistics retrieved successfully',
      {
        summary: {
          totalVisits,
          completedVisits,
          cancelledVisits,
          noShowVisits,
          completionRate: totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(2) : 0
        },
        visitsByDate,
        visitsByDepartment,
        dateRange: { startDate, endDate }
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Patient Flow Stats');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Get appointment statistics
 * @route   GET /api/analytics/appointments
 * @access  Private (Admin, Administrator)
 */
const getAppointmentStats = async (req, res) => {
  try {
    const { startDate, endDate, serviceType } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (serviceType) {
      filter.serviceType = serviceType;
    }

    const appointments = await Appointment.find(filter);

    // Group by service type
    const appointmentsByService = appointments.reduce((acc, apt) => {
      acc[apt.serviceType] = (acc[apt.serviceType] || 0) + 1;
      return acc;
    }, {});

    // Group by status
    const appointmentsByStatus = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {});

    // Calculate peak times (group by hour)
    const appointmentsByHour = appointments.reduce((acc, apt) => {
      const hour = new Date(apt.appointmentDate).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {});

    const response = ErrorHandlerService.createSuccessResponse(
      'Appointment statistics retrieved successfully',
      {
        totalAppointments: appointments.length,
        appointmentsByService,
        appointmentsByStatus,
        peakHours: appointmentsByHour,
        dateRange: { startDate, endDate }
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Appointment Stats');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Get payment mode statistics
 * @route   GET /api/analytics/payments
 * @access  Private (Admin, Administrator)
 */
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(filter);

    // Group by payment mode
    const paymentsByMode = appointments.reduce((acc, apt) => {
      if (!acc[apt.paymentMode]) {
        acc[apt.paymentMode] = { count: 0, total: 0 };
      }
      acc[apt.paymentMode].count += 1;
      acc[apt.paymentMode].total += apt.paymentAmount;
      return acc;
    }, {});

    // Calculate total revenue
    const totalRevenue = appointments.reduce((sum, apt) => sum + apt.paymentAmount, 0);
    const paidAppointments = appointments.filter(a => a.paymentStatus === 'paid').length;

    const response = ErrorHandlerService.createSuccessResponse(
      'Payment statistics retrieved successfully',
      {
        totalRevenue,
        totalTransactions: appointments.length,
        paidTransactions: paidAppointments,
        pendingPayments: appointments.length - paidAppointments,
        paymentsByMode,
        dateRange: { startDate, endDate }
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Payment Stats');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Get peak times analysis
 * @route   GET /api/analytics/peak-times
 * @access  Private (Admin, Administrator)
 */
const getPeakTimesAnalysis = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(filter);

    // Group by day of week
    const appointmentsByDayOfWeek = appointments.reduce((acc, apt) => {
      const day = new Date(apt.appointmentDate).getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[day];
      acc[dayName] = (acc[dayName] || 0) + 1;
      return acc;
    }, {});

    // Group by hour
    const appointmentsByHour = appointments.reduce((acc, apt) => {
      const hour = new Date(apt.appointmentDate).getHours();
      acc[`${hour}:00`] = (acc[`${hour}:00`] || 0) + 1;
      return acc;
    }, {});

    // Find peak day and hour
    const peakDay = Object.entries(appointmentsByDayOfWeek)
      .sort((a, b) => b[1] - a[1])[0];
    const peakHour = Object.entries(appointmentsByHour)
      .sort((a, b) => b[1] - a[1])[0];

    const response = ErrorHandlerService.createSuccessResponse(
      'Peak times analysis retrieved successfully',
      {
        appointmentsByDayOfWeek,
        appointmentsByHour,
        peakDay: peakDay ? { day: peakDay[0], count: peakDay[1] } : null,
        peakHour: peakHour ? { hour: peakHour[0], count: peakHour[1] } : null,
        dateRange: { startDate, endDate }
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Peak Times');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Get comprehensive dashboard statistics
 * @route   GET /api/analytics/dashboard
 * @access  Private (Admin, Administrator)
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalAppointments = await Appointment.countDocuments();
    const totalMedicalRecords = await MedicalRecord.countDocuments();

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    // Get this month's revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyAppointments = await Appointment.find({
      appointmentDate: { $gte: firstDayOfMonth },
      paymentStatus: 'paid'
    });
    const monthlyRevenue = monthlyAppointments.reduce((sum, apt) => sum + apt.paymentAmount, 0);

    const response = ErrorHandlerService.createSuccessResponse(
      'Dashboard statistics retrieved successfully',
      {
        users: {
          totalPatients,
          totalDoctors,
          totalStaff
        },
        appointments: {
          total: totalAppointments,
          today: todayAppointments
        },
        medicalRecords: totalMedicalRecords,
        revenue: {
          monthly: monthlyRevenue,
          monthlyAppointments: monthlyAppointments.length
        }
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get Dashboard Stats');
    res.status(500).json(errorResponse);
  }
};

/**
 * @desc    Export report data
 * @route   GET /api/analytics/export
 * @access  Private (Admin, Administrator)
 */
const exportReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, format } = req.query;

    // Validate report type
    const validReportTypes = ['patient-flow', 'appointments', 'payments', 'peak-times'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }

    const filter = {};
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientID', 'name email contactInfo')
      .populate('doctorID', 'name specialization department');

    // Return data in requested format (JSON by default)
    // In production, you'd implement CSV, PDF generation here
    const response = ErrorHandlerService.createSuccessResponse(
      'Report data exported successfully',
      {
        reportType,
        dateRange: { startDate, endDate },
        format: format || 'json',
        totalRecords: appointments.length,
        data: appointments
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Export Report');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  getPatientFlowStats,
  getAppointmentStats,
  getPaymentStats,
  getPeakTimesAnalysis,
  getDashboardStats,
  exportReport
};