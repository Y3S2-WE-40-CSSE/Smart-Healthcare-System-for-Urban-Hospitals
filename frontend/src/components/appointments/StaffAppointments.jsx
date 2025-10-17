import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StaffAppointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, today, upcoming
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data.appointments);
        extractDoctorsFromAppointments(data.data.appointments);
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

  const extractDoctorsFromAppointments = (appointments) => {
    const doctorMap = new Map();
    
    appointments.forEach(apt => {
      if (apt.doctorID && !doctorMap.has(apt.doctorID._id)) {
        doctorMap.set(apt.doctorID._id, {
          ...apt.doctorID,
          appointments: []
        });
      }
    });

    // Group appointments by doctor
    appointments.forEach(apt => {
      if (apt.doctorID && doctorMap.has(apt.doctorID._id)) {
        doctorMap.get(apt.doctorID._id).appointments.push(apt);
      }
    });

    setDoctors(Array.from(doctorMap.values()));
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

  const filterAppointments = (doctorAppointments) => {
    const now = new Date();
    
    switch (activeFilter) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        return doctorAppointments.filter(apt => {
          const aptDate = new Date(apt.dateTime);
          return aptDate >= todayStart && aptDate < todayEnd && apt.status !== 'cancelled';
        });
      
      case 'upcoming':
        return doctorAppointments.filter(apt => {
          const aptDate = new Date(apt.dateTime);
          return aptDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
        });
      
      default:
        return doctorAppointments;
    }
  };

  const getDoctorStats = (doctor) => {
    const filteredApps = filterAppointments(doctor.appointments);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayAppointments = doctor.appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= todayStart && aptDate < todayEnd && apt.status !== 'cancelled';
    });

    const upcomingAppointments = doctor.appointments.filter(apt => {
      const aptDate = new Date(apt.dateTime);
      return aptDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
    });

    return {
      total: filteredApps.length,
      today: todayAppointments.length,
      upcoming: upcomingAppointments.length,
      scheduled: doctor.appointments.filter(apt => apt.status === 'scheduled').length,
      confirmed: doctor.appointments.filter(apt => apt.status === 'confirmed').length
    };
  };

  const DoctorCard = ({ doctor }) => {
    const stats = getDoctorStats(doctor);
    const filteredAppointments = filterAppointments(doctor.appointments);

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
        {/* Doctor Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                Dr. {doctor.name?.charAt(0) || 'D'}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Dr. {doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
              <p className="text-sm text-gray-500">{doctor.department}</p>
              <p className="text-sm text-gray-500">{doctor.contactInfo}</p>
            </div>
          </div>
          
          {/* Doctor Stats */}
          <div className="flex space-x-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-xs text-gray-500">Confirmed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.scheduled}</div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
            </svg>
            <p>No appointments found for this doctor</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Appointments ({filteredAppointments.length})
            </h4>
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-semibold text-gray-900">
                        {appointment.patientID?.name}
                      </h5>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        <span className="mr-1">{getStatusIcon(appointment.status)}</span>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
                        </svg>
                        <span>{formatDateTime(appointment.dateTime)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span>{appointment.department}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{appointment.patientID?.contactInfo}</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="flex-1">
                          <strong>Reason:</strong> {appointment.reason}
                        </span>
                      </div>
                    </div>

                    {/* Patient Health Information */}
                    {(appointment.patientID?.allergies && appointment.patientID.allergies !== 'None') && (
                      <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="flex items-center text-red-700">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <strong>Allergies:</strong> {appointment.patientID.allergies}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  const totalAppointments = appointments.length;
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.dateTime);
    return aptDate >= new Date() && apt.status !== 'cancelled' && apt.status !== 'completed';
  }).length;
  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const aptDate = new Date(apt.dateTime);
    return aptDate >= todayStart && aptDate < todayEnd && apt.status !== 'cancelled';
  }).length;

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
              <h1 className="text-3xl font-bold text-gray-900">Appointments Management</h1>
              <p className="text-gray-600 mt-2">View and manage all doctor appointments</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={fetchAllAppointments}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
                <p className="text-3xl font-bold mt-2">{totalAppointments}</p>
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
                <p className="text-green-100 text-sm font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold mt-2">{todayAppointments}</p>
              </div>
              <div className="text-green-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Upcoming</p>
                <p className="text-3xl font-bold mt-2">{upcomingAppointments}</p>
              </div>
              <div className="text-purple-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            {[
              { id: 'all', name: 'All Appointments' },
              { id: 'today', name: "Today's Appointments" },
              { id: 'upcoming', name: 'Upcoming' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-6">
          {doctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-500">There are no appointments scheduled with any doctors.</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffAppointments;