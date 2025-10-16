import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctorID: '',
    department: '',
    dateTime: '',
    reason: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments/doctors/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setDoctors(data.data.doctors);
      } else {
        setErrors({ general: data.message || 'Failed to load doctors' });
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setErrors({ general: 'Failed to load doctors list' });
    } finally {
      setFetchingDoctors(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name === 'doctorID') {
      const selectedDoctor = doctors.find(doc => doc._id === value);
      if (selectedDoctor) {
        setFormData(prev => ({
          ...prev,
          department: selectedDoctor.department
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = {};
    if (!formData.doctorID) newErrors.doctorID = 'Please select a doctor';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.dateTime) newErrors.dateTime = 'Please select date and time';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for appointment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate('/appointments', { 
          state: { message: 'Appointment booked successfully!' } 
        });
      } else {
        if (data.errorsByField) {
          setErrors(data.errorsByField);
        } else {
          setErrors({ general: data.message });
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setErrors({ general: 'Failed to book appointment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingDoctors) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/appointments')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Appointments
          </button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Book New Appointment</h1>
            <p className="text-gray-600 mt-2">Schedule your healthcare appointment with our specialists</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Appointment Details</h2>
            <p className="text-blue-100 text-sm mt-1">Fill in the details to schedule your appointment</p>
          </div>

          <div className="p-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800">{errors.general}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Doctor Selection */}
              <div>
                <label htmlFor="doctorID" className="block text-sm font-medium text-gray-700 mb-3">
                  Select Doctor *
                </label>
                <select
                  id="doctorID"
                  name="doctorID"
                  required
                  value={formData.doctorID}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.doctorID ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Choose a specialist doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.name} - {doctor.specialization} ({doctor.department})
                    </option>
                  ))}
                </select>
                {errors.doctorID && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {errors.doctorID}
                  </p>
                )}
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-3">
                  Department *
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Cardiology, Neurology, Pediatrics"
                />
                {errors.department && (
                  <p className="text-red-600 text-sm mt-2">{errors.department}</p>
                )}
              </div>

              {/* Date and Time */}
              <div>
                <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  required
                  value={formData.dateTime}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.dateTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.dateTime && (
                  <p className="text-red-600 text-sm mt-2">{errors.dateTime}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Please select a future date and time for your appointment
                </p>
              </div>

              {/* Reason for Appointment */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-3">
                  Reason for Appointment *
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  required
                  rows="4"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none ${
                    errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Please describe the reason for your appointment in detail. This helps the doctor prepare for your visit."
                />
                {errors.reason && (
                  <p className="text-red-600 text-sm mt-2">{errors.reason}</p>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder="Any additional information you'd like to share with the doctor, such as current medications, recent test results, or specific concerns."
                />
                <p className="text-sm text-gray-500 mt-2">
                  This information will help the doctor provide better care
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Booking Appointment...
                    </>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/appointments')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold transition-colors duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Information */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Booking Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Select a doctor from your preferred department</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Choose a convenient date and time for your visit</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Provide detailed information about your health concerns</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>You can cancel appointments up to 24 hours in advance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;