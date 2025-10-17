import React, { useState } from 'react';
import { extractValidationErrors, formatErrorMessage } from '../utils/errorHandler';
import { patientAPI } from '../services/api';
import RegistrationSuccess from './RegistrationSuccess';

/**
 * PatientRegistrationForm - Handles only form display and submission
 * Follows Single Responsibility Principle
 */
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
      const response = await patientAPI.register(formData);

      if (response.data.success) {
        setSuccess({
          message: 'Patient registered successfully!',
          patientData: response.data.data
        });
      } else {
        const fieldErrors = extractValidationErrors(response.data);
        setErrors({
          general: formatErrorMessage(response.data),
          ...fieldErrors
        });
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        const fieldErrors = extractValidationErrors(errorData);
        setErrors({
          general: formatErrorMessage(errorData),
          ...fieldErrors
        });
      } else {
        setErrors({
          general: 'Network error. Please check your connection and try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onSuccess) {
      onSuccess(success.patientData);
    }
    setSuccess(null);
    setFormData({
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
  };

  // Show success component if registration successful
  if (success) {
    return (
      <RegistrationSuccess 
        successData={success}
        onClose={handleClose}
      />
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
          <FormInput
            label="Full Name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter patient's full name"
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="patient@example.com"
          />

          <FormInput
            label="Contact Number"
            name="contactInfo"
            type="tel"
            required
            value={formData.contactInfo}
            onChange={handleChange}
            error={errors.contactInfo}
            placeholder="+1234567890"
          />

          <FormInput
            label="NIC Number"
            name="nicNumber"
            value={formData.nicNumber}
            onChange={handleChange}
            placeholder="Optional"
          />

          <FormInput
            label="Date of Birth"
            name="DOB"
            type="date"
            required
            value={formData.DOB}
            onChange={handleChange}
            error={errors.DOB}
          />

          <FormSelect
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select gender' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
              { value: 'Prefer not to say', label: 'Prefer not to say' }
            ]}
          />

          <FormSelect
            label="Blood Group"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            options={[
              { value: '', label: 'Select blood group' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' }
            ]}
          />

          <FormInput
            label="Emergency Contact"
            name="emergencyContact"
            type="tel"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="Emergency contact number"
          />
        </div>

        <FormTextarea
          label="Address"
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="Enter complete address"
          rows={2}
        />

        {/* Medical Information */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
          
          <div className="space-y-4">
            <FormInput
              label="Allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List any known allergies (optional)"
            />

            <FormTextarea
              label="Medical History"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              placeholder="Enter relevant medical history (optional)"
              rows={3}
            />
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

// Reusable Form Components (following ISP)
const FormInput = ({ label, name, type = 'text', required, value, onChange, error, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && '*'}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const FormSelect = ({ label, name, value, onChange, options, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      name={name}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      value={value}
      onChange={onChange}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const FormTextarea = ({ label, name, required, value, onChange, error, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && '*'}
    </label>
    <textarea
      name={name}
      required={required}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default PatientRegistrationForm;