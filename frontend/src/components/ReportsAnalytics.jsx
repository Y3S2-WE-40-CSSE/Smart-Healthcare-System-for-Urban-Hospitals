import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('patient-flow');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [error, setError] = useState('');

  // Load dashboard stats on component mount
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();
      setDashboardStats(response.data.data);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let response;
      const params = { startDate, endDate };

      switch (reportType) {
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
      
      // Check for "No result found" scenario
      if (err.response?.data?.data && Object.keys(err.response.data.data).length === 0) {
        setError('No result found for the selected criteria.');
        setReportData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const params = { reportType, startDate, endDate, format: 'json' };
      const response = await analyticsAPI.exportReport(params);
      
      // Create a download link
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString()}.json`;
      link.click();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Data Analysis & Reporting</h2>
        <p className="opacity-90">Generate comprehensive reports and analytics for healthcare management</p>
      </div>

      {/* Dashboard Summary Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-blue-50">
            <h3 className="text-sm font-medium text-gray-600">Total Patients</h3>
            <p className="text-3xl font-bold text-blue-600">{dashboardStats.users?.totalPatients || 0}</p>
          </div>
          <div className="card bg-green-50">
            <h3 className="text-sm font-medium text-gray-600">Total Doctors</h3>
            <p className="text-3xl font-bold text-green-600">{dashboardStats.users?.totalDoctors || 0}</p>
          </div>
          <div className="card bg-purple-50">
            <h3 className="text-sm font-medium text-gray-600">Today's Appointments</h3>
            <p className="text-3xl font-bold text-purple-600">{dashboardStats.appointments?.today || 0}</p>
          </div>
          <div className="card bg-yellow-50">
            <h3 className="text-sm font-medium text-gray-600">Monthly Revenue</h3>
            <p className="text-3xl font-bold text-yellow-600">
              ${dashboardStats.revenue?.monthly?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      )}

      {/* Report Generation Form */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Generate Report</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
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

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Report Results</h3>
            <button
              onClick={downloadReport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Report
            </button>
          </div>

          {/* Patient Flow Report */}
          {reportType === 'patient-flow' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary?.totalVisits || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{reportData.summary?.completedVisits || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{reportData.summary?.cancelledVisits || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">No-Show</p>
                  <p className="text-2xl font-bold text-yellow-600">{reportData.summary?.noShowVisits || 0}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData.summary?.completionRate || 0}%</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Visits by Department</h4>
                {Object.entries(reportData.visitsByDepartment || {}).map(([dept, count]) => (
                  <div key={dept} className="flex justify-between py-1">
                    <span className="text-gray-700">{dept}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointment Statistics Report */}
          {reportType === 'appointments' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.totalAppointments || 0}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">By Service Type</h4>
                  {Object.entries(reportData.appointmentsByService || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between py-1">
                      <span className="text-gray-700 capitalize">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">By Status</h4>
                  {Object.entries(reportData.appointmentsByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between py-1">
                      <span className="text-gray-700 capitalize">{status}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Statistics Report */}
          {reportType === 'payments' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${reportData.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{reportData.totalTransactions || 0}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.paidTransactions || 0}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{reportData.pendingPayments || 0}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Payments by Mode</h4>
                {Object.entries(reportData.paymentsByMode || {}).map(([mode, data]) => (
                  <div key={mode} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700 capitalize">{mode}</span>
                    <div className="text-right">
                      <span className="font-semibold">{data.count} transactions</span>
                      <span className="text-gray-600 ml-4">${data.total?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Peak Times Report */}
          {reportType === 'peak-times' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Peak Day</h4>
                  <p className="text-2xl font-bold text-blue-600">{reportData.peakDay?.day || 'N/A'}</p>
                  <p className="text-gray-600">{reportData.peakDay?.count || 0} appointments</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Peak Hour</h4>
                  <p className="text-2xl font-bold text-purple-600">{reportData.peakHour?.hour || 'N/A'}</p>
                  <p className="text-gray-600">{reportData.peakHour?.count || 0} appointments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Appointments by Day of Week</h4>
                  {Object.entries(reportData.appointmentsByDayOfWeek || {}).map(([day, count]) => (
                    <div key={day} className="flex justify-between py-1">
                      <span className="text-gray-700">{day}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-lg max-h-80 overflow-y-auto">
                  <h4 className="font-semibold mb-2">Appointments by Hour</h4>
                  {Object.entries(reportData.appointmentsByHour || {})
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([hour, count]) => (
                      <div key={hour} className="flex justify-between py-1">
                        <span className="text-gray-700">{hour}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsAnalytics;