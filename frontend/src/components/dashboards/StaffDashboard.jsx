import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StaffDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
        <p className="opacity-90">Hospital Staff Dashboard - {user?.department}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Patient Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage patient registrations and information</p>
          <button className="btn-primary w-full">Manage Patients</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4m0 0h8m-8 0V7a4 4 0 118 0v4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Appointments</h3>
          </div>
          <p className="text-gray-600 mb-4">Schedule and manage patient appointments</p>
          <button className="btn-primary w-full">Manage Appointments</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Generate and view hospital reports</p>
          <button className="btn-primary w-full">View Reports</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Inventory</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage medical supplies and inventory</p>
          <button className="btn-primary w-full">View Inventory</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Health Cards</h3>
          </div>
          <p className="text-gray-600 mb-4">Issue and manage digital health cards</p>
          <button className="btn-primary w-full">Manage Cards</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Profile</h3>
          </div>
          <p className="text-gray-600 mb-4">Update your staff information</p>
          <button className="btn-primary w-full">Edit Profile</button>
        </div>
      </div>

      {/* Staff Info Card */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Department</label>
            <p className="text-gray-900">{user?.department || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Contact</label>
            <p className="text-gray-900">{user?.contactInfo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900 capitalize">{user?.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Member Since</label>
            <p className="text-gray-900">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;