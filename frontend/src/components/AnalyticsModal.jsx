import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { formatErrorMessage } from '../utils/errorHandler'; // Change this import

const AnalyticsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('dashboard');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [department, setDepartment] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Add this helper function to handle API errors
  const handleApiError = (err) => {
    if (err.response?.data) {
      return formatErrorMessage(err.response.data);
    }
    return err.message || 'An unexpected error occurred';
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      let response;
      const params = { startDate, endDate };
      
      if (department) params.department = department;
      if (serviceType) params.serviceType = serviceType;

      switch (reportType) {
        case 'dashboard':
          response = await analyticsAPI.getDashboardStats();
          break;
        case 'patient-flow':
          response = await analyticsAPI.getPatientFlow(params);
          break;
        case 'appointments':
          response = await analyticsAPI.getAppointmentStats(params);
          break;
        case 'payments':
          response = await analyticsAPI.getPaymentStats(params);
          break;
        case 'peak-times':
          response = await analyticsAPI.getPeakTimes(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      if (response.data.success) {
        setReportData(response.data.data);
        setError('');
      } else {
        setError(response.data.message || 'Failed to generate report');
      }
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const params = { reportType, startDate, endDate, format: 'json' };
      if (department) params.department = department;
      if (serviceType) params.serviceType = serviceType;
      
      const response = await analyticsAPI.exportReport(params);
      
      // Create download
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">System Analytics & Reports</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Report Generation Form */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="dashboard">Dashboard Overview</option>
                <option value="patient-flow">Patient Flow</option>
                <option value="appointments">Appointment Statistics</option>
                <option value="payments">Payment Modes</option>
                <option value="peak-times">Peak Times Analysis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {(reportType === 'patient-flow') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            )}

            {(reportType === 'appointments') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Services</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            
            {reportData && (
              <button
                onClick={downloadReport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Report
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
              {error}
            </div>
          )}
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Report Results</h3>
            
            {/* Dashboard Stats */}
            {reportType === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Total Patients</h4>
                  <p className="text-2xl font-bold text-blue-600">{reportData.users?.totalPatients || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Total Doctors</h4>
                  <p className="text-2xl font-bold text-green-600">{reportData.users?.totalDoctors || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Total Appointments</h4>
                  <p className="text-2xl font-bold text-purple-600">{reportData.appointments?.total || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800">Today's Appointments</h4>
                  <p className="text-2xl font-bold text-yellow-600">{reportData.appointments?.today || 0}</p>
                </div>
              </div>
            )}

            {/* Patient Flow Stats */}
            {reportType === 'patient-flow' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Visits</p>
                    <p className="text-xl font-bold">{reportData.totalVisits || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">{reportData.completedVisits || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Cancelled</p>
                    <p className="text-xl font-bold text-red-600">{reportData.cancelledVisits || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">No Show</p>
                    <p className="text-xl font-bold text-orange-600">{reportData.noShowVisits || 0}</p>
                  </div>
                </div>
                
                {reportData.visitsByDepartment && (
                  <div>
                    <h4 className="font-semibold mb-2">Visits by Department</h4>
                    {Object.entries(reportData.visitsByDepartment).map(([dept, count]) => (
                      <div key={dept} className="flex justify-between py-1">
                        <span>{dept}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Peak Times Stats */}
            {reportType === 'peak-times' && reportData.peakDay && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Peak Day</h4>
                    <p className="text-lg font-bold text-blue-600">
                      {reportData.peakDay.day} ({reportData.peakDay.count} appointments)
                    </p>
                  </div>
                  {reportData.peakHour && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800">Peak Hour</h4>
                      <p className="text-lg font-bold text-green-600">
                        {reportData.peakHour.hour} ({reportData.peakHour.count} appointments)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Appointment Stats */}
            {reportType === 'appointments' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold">{reportData.totalAppointments || 0}</p>
                </div>
                
                {reportData.appointmentsByService && (
                  <div>
                    <h4 className="font-semibold mb-2">Appointments by Service</h4>
                    {Object.entries(reportData.appointmentsByService).map(([service, count]) => (
                      <div key={service} className="flex justify-between py-1">
                        <span>{service}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}

                {reportData.appointmentsByStatus && (
                  <div>
                    <h4 className="font-semibold mb-2">Appointments by Status</h4>
                    {Object.entries(reportData.appointmentsByStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between py-1">
                        <span className="capitalize">{status}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Stats */}
            {reportType === 'payments' && (
              <div className="space-y-4">
                {reportData.totalRevenue !== undefined && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${reportData.totalRevenue || 0}</p>
                  </div>
                )}
                
                {reportData.paymentsByMode && (
                  <div>
                    <h4 className="font-semibold mb-2">Payments by Mode</h4>
                    {Object.entries(reportData.paymentsByMode).map(([mode, count]) => (
                      <div key={mode} className="flex justify-between py-1">
                        <span className="capitalize">{mode}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsModal;
