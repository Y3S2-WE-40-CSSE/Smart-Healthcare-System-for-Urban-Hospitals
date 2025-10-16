import React, { useState } from 'react';
import { extractValidationErrors, formatErrorMessage } from '../utils/errorHandler';

const PatientRegistrationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    nicNumber: '',
    DOB: '',
    address: '',
    allergies: '',
    medicalHistory: '',
    bloodGroup: '',
    emergencyContact: '',
    gender: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
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
    setLoading(true);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess({
          message: 'Patient registered successfully!',
          patientData: data.data
        });
        
        // Call success callback after 2 seconds
        setTimeout(() => {
          if (onSuccess) onSuccess(data.data);
        }, 2000);
      } else {
        const fieldErrors = extractValidationErrors(data);
        setErrors({
          general: formatErrorMessage(data),
          ...fieldErrors
        });
      }
    } catch (error) {
      setErrors({
        general: 'Network error. Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{success.message}</h3>
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
            <div className="text-left space-y-1 text-sm">
              <p><strong>Patient ID:</strong> {success.patientData.patient._id}</p>
              <p><strong>Health Card ID:</strong> {success.patientData.healthCard.cardID}</p>
              <p><strong>Temporary Password:</strong> 
                <span className="font-mono bg-yellow-100 px-2 py-1 rounded ml-2">
                  {success.patientData.temporaryPassword}
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              ⚠️ Please save this temporary password and provide it to the patient.
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Confirmation email and SMS have been sent to the patient.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Patient Registration</h2>
      
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">⚠️ {errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter patient's full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.email}
              onChange={handleChange}
              placeholder="patient@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              name="contactInfo"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contactInfo ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="+1234567890"
            />
            {errors.contactInfo && <p className="text-red-500 text-sm mt-1">{errors.contactInfo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIC Number
            </label>
            <input
              type="text"
              name="nicNumber"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.nicNumber}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              name="DOB"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.DOB ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.DOB}
              onChange={handleChange}
            />
            {errors.DOB && <p className="text-red-500 text-sm mt-1">{errors.DOB}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Blood Group
            </label>
            <select
              name="bloodGroup"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.bloodGroup}
              onChange={handleChange}
            >
              <option value="">Select blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact
            </label>
            <input
              type="tel"
              name="emergencyContact"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.emergencyContact}
              onChange={handleChange}
              placeholder="Emergency contact number"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <textarea
            name="address"
            required
            rows="2"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter complete address"
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>

        {/* Medical Information */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <input
                type="text"
                name="allergies"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any known allergies (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical History
              </label>
              <textarea
                name="medicalHistory"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Enter relevant medical history (optional)"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Registering Patient...' : 'Register Patient'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PatientRegistrationForm;