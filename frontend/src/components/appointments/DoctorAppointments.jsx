import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    confirmed: 0,
    pending: 0,
    thisMonth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/doctor', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data.appointments);
        calculateStats(data.data.appointments);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments) => {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    const todayAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= todayStart && aptDate <= todayEnd && apt.status !== 'cancelled';
    });

    const thisMonthAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= thisMonthStart && aptDate <= thisMonthEnd && apt.status !== 'cancelled';
    });

    setStats({
      today: todayAppointments.length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      pending: appointments.filter(apt => apt.status === 'scheduled').length,
      thisMonth: thisMonthAppointments.length
    });
  };

  const confirmAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'confirmed' } : apt
        ));
        calculateStats(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'confirmed' } : apt
        ));
      } else {
        alert(data.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment');
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'completed' } : apt
        ));
        calculateStats(appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, status: 'completed' } : apt
        ));
      } else {
        alert(data.message || 'Failed to complete appointment');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Failed to complete appointment');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      confirmed: 'bg-green-50 text-green-800 border-green-200',
      completed: 'bg-blue-50 text-blue-800 border-blue-200',
      cancelled: 'bg-red-50 text-red-800 border-red-200',
      'no-show': 'bg-orange-50 text-orange-800 border-orange-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: '⏰',
      confirmed: '✅',
      completed: '📋',
      cancelled: '❌',
      'no-show': '🚫'
    };
    return icons[status] || '📅';
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeFromDate = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.dateTime) >= now && apt.status !== 'cancelled' && apt.status !== 'completed')
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  };

  const getTodayAppointments = () => {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    return appointments
      .filter(apt => {
        const aptDate = new Date(apt.dateTime);
        return aptDate >= todayStart && aptDate <= todayEnd && apt.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.dateTime) < now || apt.status === 'completed' || apt.status === 'cancelled')
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {appointment.patientID?.name?.charAt(0) || 'P'}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{appointment.patientID?.name}</h3>
            <p className="text-sm text-gray-500">{appointment.patientID?.contactInfo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
            <span className="mr-1">{getStatusIcon(appointment.status)}</span>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
          {appointment.status === 'scheduled' && (
            <button
              onClick={() => confirmAppointment(appointment._id)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Confirm
            </button>
          )}
          {appointment.status === 'confirmed' && (
            <button
              onClick={() => completeAppointment(appointment._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Complete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
            </svg>
            <span className="font-medium text-gray-900 mr-2">Time:</span>
            {formatDateTime(appointment.dateTime)}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium text-gray-900 mr-2">Department:</span>
            {appointment.department}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-gray-900 mr-2">Reason:</span>
            {appointment.reason}
          </div>
          {appointment.notes && (
            <div className="flex items-start text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="font-medium text-gray-900 mr-2">Notes:</span>
              {appointment.notes}
            </div>
          )}
        </div>
      </div>

      {(appointment.patientID?.allergies && appointment.patientID.allergies !== 'None') || 
       (appointment.patientID?.medicalHistory && appointment.patientID.medicalHistory !== 'No significant medical history') ? (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Patient Health Information</h4>
          <div className="space-y-2 text-sm">
            {appointment.patientID?.allergies && appointment.patientID.allergies !== 'None' && (
              <div className="flex items-center text-red-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span><strong>Allergies:</strong> {appointment.patientID.allergies}</span>
              </div>
            )}
            {appointment.patientID?.medicalHistory && appointment.patientID.medicalHistory !== 'No significant medical history' && (
              <div className="flex items-start text-gray-600">
                <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span><strong>Medical History:</strong> {appointment.patientID.medicalHistory}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  const upcomingAppointments = getUpcomingAppointments();
  const todayAppointments = getTodayAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Consultations</h1>
              <p className="text-gray-600 mt-2">Manage your appointments and patient consultations</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={fetchAppointments}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold mt-2">{stats.today}</p>
              </div>
              <div className="text-blue-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Confirmed</p>
                <p className="text-3xl font-bold mt-2">{stats.confirmed}</p>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2">{stats.pending}</p>
              </div>
              <div className="text-yellow-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold mt-2">{stats.thisMonth}</p>
              </div>
              <div className="text-purple-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'today', name: `Today (${todayAppointments.length})`, appointments: todayAppointments },
                { id: 'upcoming', name: `Upcoming (${upcomingAppointments.length})`, appointments: upcomingAppointments },
                { id: 'past', name: `Past (${pastAppointments.length})`, appointments: pastAppointments }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div>
          {(() => {
            const currentAppointments = 
              activeTab === 'today' ? todayAppointments :
              activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

            return currentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500">
                  {activeTab === 'today' ? "You don't have any appointments scheduled for today." :
                   activeTab === 'upcoming' ? "You don't have any upcoming appointments." :
                   "You don't have any past appointments."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {currentAppointments.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;