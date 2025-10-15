import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'patient',
  contactInfo: '',
  nicNumber: '', // Add this line
  department: '',
  specialization: '',
  licenseNumber: '',
  DOB: '',
  address: '',
  allergies: '',
  medicalHistory: ''
});

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    // Prepare data for backend - remove confirmPassword and handle optional fields
    const submitData = { ...formData };
    delete submitData.confirmPassword;

    // Remove licenseNumber for non-doctor roles to avoid unique constraint issues
    if (submitData.role !== 'doctor') {
      delete submitData.licenseNumber;
      delete submitData.specialization;
    }

    // Remove department for non-staff/doctor/admin roles
    if (!['staff', 'doctor', 'admin'].includes(submitData.role)) {
      delete submitData.department;
    }

    // Remove patient-specific fields for non-patient roles
    if (submitData.role !== 'patient') {
      delete submitData.DOB;
      delete submitData.address;
    }

    // Set default values for optional fields
    if (!submitData.allergies) submitData.allergies = 'None';
    if (!submitData.medicalHistory) submitData.medicalHistory = 'No significant medical history';

    const result = await register(submitData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: result.message });
      if (result.errors) {
        const fieldErrors = {};
        result.errors.forEach(error => {
          fieldErrors[error.path] = error.msg;
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Smart Healthcare System
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="nicNumber" className="block text-sm font-medium text-gray-700">
                NIC Number
              </label>
              <input
                id="nicNumber"
                name="nicNumber"
                type="text"
                required
                className="input-field"
                placeholder="Enter your NIC number"
                value={formData.nicNumber}
                onChange={handleChange}
              />
              {errors.nicNumber && <p className="text-red-500 text-sm mt-1">{errors.nicNumber}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="staff">Staff</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
                Contact Information
              </label>
              <input
                id="contactInfo"
                name="contactInfo"
                type="text"
                required
                className="input-field"
                placeholder="Enter your contact information"
                value={formData.contactInfo}
                onChange={handleChange}
              />
              {errors.contactInfo && <p className="text-red-500 text-sm mt-1">{errors.contactInfo}</p>}
            </div>

            {/* Patient-specific fields */}
            {formData.role === 'patient' && (
              <>
                <div>
                  <label htmlFor="DOB" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                    id="DOB"
                    name="DOB"
                    type="date"
                    required
                    className="input-field"
                    value={formData.DOB}
                    onChange={handleChange}
                  />
                  {errors.DOB && <p className="text-red-500 text-sm mt-1">{errors.DOB}</p>}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                    Allergies
                  </label>
                  <input
                    id="allergies"
                    name="allergies"
                    type="text"
                    className="input-field"
                    placeholder="List any allergies (optional)"
                    value={formData.allergies}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    className="input-field"
                    placeholder="Enter medical history (optional)"
                    rows="3"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* Staff/Doctor/Admin specific fields */}
            {(formData.role === 'staff' || formData.role === 'doctor' || formData.role === 'admin') && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your department"
                  value={formData.department}
                  onChange={handleChange}
                />
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
              </div>
            )}

            {/* Doctor-specific fields */}
            {formData.role === 'doctor' && (
              <>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    name="specialization"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter your specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                  {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
                </div>

                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                    License Number
                  </label>
                  <input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input-field"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;