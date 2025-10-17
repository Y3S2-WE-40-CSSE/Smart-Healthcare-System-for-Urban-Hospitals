import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../../components/PaymentModal';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [formData, setFormData] = useState({
    doctorID: '',
    department: '',
    dateTime: '',
    reason: '',
    notes: '',
    duration: 30
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentError, setPaymentError] = useState('');

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

  const fetchAvailableSlots = async (doctorId, date, duration) => {
    if (!doctorId || !date) return;
    
    setLoadingSlots(true);
    setAvailableSlots([]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/appointments/doctors/${doctorId}/slots?date=${date}&duration=${duration}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.data.availableSlots);
      } else {
        setErrors({ slots: data.message || 'Failed to load available slots' });
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setErrors({ slots: 'Failed to load available time slots' });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      doctorID: value,
      dateTime: '' // Reset time slot when doctor changes
    }));
    
    const selectedDoctor = doctors.find(doc => doc._id === value);
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        department: selectedDoctor.department
      }));
    }

    // Fetch slots if date is already selected
    if (selectedDate && value) {
      fetchAvailableSlots(value, selectedDate, selectedDuration);
    }

    if (errors.doctorID) {
      setErrors(prev => ({ ...prev, doctorID: '' }));
    }
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    
    // Fetch slots if doctor is already selected
    if (formData.doctorID && date) {
      fetchAvailableSlots(formData.doctorID, date, selectedDuration);
    }

    setFormData(prev => ({
      ...prev,
      dateTime: '' // Reset selected time slot when date changes
    }));
  };

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value);
    setSelectedDuration(duration);
    setFormData(prev => ({
      ...prev,
      duration: duration,
      dateTime: '' // Reset selected time slot when duration changes
    }));

    // Refetch slots with new duration
    if (formData.doctorID && selectedDate) {
      fetchAvailableSlots(formData.doctorID, selectedDate, duration);
    }
  };

  const handleTimeSlotSelect = (slotTime) => {
    setFormData(prev => ({
      ...prev,
      dateTime: slotTime
    }));
    
    if (errors.dateTime) {
      setErrors(prev => ({ ...prev, dateTime: '' }));
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setPaymentError('');
    setLoading(true);

    const newErrors = {};
    if (!formData.doctorID) newErrors.doctorID = 'Please select a doctor';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.dateTime) newErrors.dateTime = 'Please select an available time slot';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for appointment is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Show payment modal instead of directly submitting
    setShowPaymentModal(true);
    setLoading(false);
  };

  const handlePaymentSuccess = (result) => {
    setShowPaymentModal(false);
    
    const successMessage = result.transaction.status === 'covered' 
      ? 'Appointment booked successfully under government coverage!'
      : result.transaction.status === 'paid'
      ? `Appointment booked successfully! Payment of ${formatCurrency(result.payment.amount)} processed.`
      : 'Appointment booked successfully! Please bring payment when you visit.';

    navigate('/appointments', { 
      state: { 
        message: successMessage,
        appointment: result.appointment
      } 
    });
  };

  const handlePaymentFailure = (errorMessage) => {
    setPaymentError(errorMessage);
    setShowPaymentModal(false);
  };

  const getSelectedDoctorName = () => {
    const doctor = doctors.find(doc => doc._id === formData.doctorID);
    return doctor ? doctor.name : '';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeSlot = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Payment Error Display */}
        {paymentError && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">Payment Failed</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{paymentError}</p>
              <button
                onClick={() => setPaymentError('')}
                className="text-red-600 hover:text-red-800 text-sm mt-2 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}

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
                  onChange={handleDoctorChange}
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
                  readOnly
                />
                {errors.department && (
                  <p className="text-red-600 text-sm mt-2">{errors.department}</p>
                )}
              </div>

              {/* Appointment Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-3">
                  Appointment Duration *
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={selectedDuration}
                  onChange={handleDurationChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Select how long you need for your appointment
                </p>
              </div>

              {/* Date Selection */}
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-3">
                  Select Date *
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  required
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                    errors.dateTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {selectedDate && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    {formatDisplayDate(selectedDate)}
                  </p>
                )}
              </div>

              {/* Time Slot Selection */}
              {(formData.doctorID && selectedDate) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots {loadingSlots && '(Loading...)'}
                  </label>
                  
                  {errors.slots && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-yellow-800">{errors.slots}</span>
                      </div>
                    </div>
                  )}

                  {loadingSlots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[...Array(8)].map((_, index) => (
                        <div key={index} className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTimeSlotSelect(slot)}
                          className={`p-3 border-2 rounded-xl text-center transition-all duration-200 font-medium ${
                            formData.dateTime === slot
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-25'
                          }`}
                        >
                          {formatTimeSlot(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">No available slots for this date and duration</p>
                      <p className="text-sm text-gray-400 mt-1">Please try a different date or duration</p>
                    </div>
                  )}

                  {formData.dateTime && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-800 font-medium">Selected Time</p>
                          <p className="text-green-600">
                            {new Date(formData.dateTime).toLocaleDateString()} at {formatTimeSlot(formData.dateTime)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, dateTime: '' }))}
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {errors.dateTime && (
                    <p className="text-red-600 text-sm mt-2">{errors.dateTime}</p>
                  )}
                </div>
              )}

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
                  disabled={loading || !formData.dateTime}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
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
              <span>Select a doctor and choose your preferred appointment duration</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Pick a date to see available time slots</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Click on an available time slot to select it</span>
            </div>
            <div className="flex items-start">
              <svg className="w-4 h-4 mr-2 mt-0.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Complete payment to confirm your appointment</span>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          appointmentData={{
            ...formData,
            doctorName: getSelectedDoctorName()
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailure={handlePaymentFailure}
        />
      </div>
    </div>
  );
};

export default BookAppointment;