import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    contactInfo: '',
    department: '',
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

    const result = await register(formData);
    
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

  const renderRoleSpecificFields = () => {
    if (formData.role === 'patient') {
      return (
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
            <textarea
              id="address"
              name="address"
              required
              className="input-field"
              placeholder="Enter your address"
              rows="3"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
              Allergies (Optional)
            </label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              className="input-field"
              placeholder="Any known allergies"
              value={formData.allergies}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
              Medical History (Optional)
            </label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              className="input-field"
              placeholder="Brief medical history"
              rows="3"
              value={formData.medicalHistory}
              onChange={handleChange}
            />
          </div>
        </>
      );
    } else if (formData.role === 'staff') {
      return (
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="department"
            name="department"
            required
            className="input-field"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            <option value="Emergency">Emergency</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Radiology">Radiology</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Administration">Administration</option>
          </select>
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Join Healthcare System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account to access medical services
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg" onSubmit={handleSubmit}>
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
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                I am a
              </label>
              <select
                id="role"
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="staff">Hospital Staff</option>
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
                placeholder="Phone number or contact details"
                value={formData.contactInfo}
                onChange={handleChange}
              />
              {errors.contactInfo && <p className="text-red-500 text-sm mt-1">{errors.contactInfo}</p>}
            </div>

            {renderRoleSpecificFields()}

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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
