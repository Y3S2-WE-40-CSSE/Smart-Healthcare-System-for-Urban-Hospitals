import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h2>
        <p className="opacity-90">
          {user?.role === 'administrator' ? 'Super Administrator' : 'Hospital Administrator'} - {user?.department}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">User Management</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage all system users and roles</p>
          <button className="btn-primary w-full">Manage Users</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">System Analytics</h3>
          </div>
          <p className="text-gray-600 mb-4">View system usage and analytics</p>
          <button className="btn-primary w-full">View Analytics</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Hospital Settings</h3>
          </div>
          <p className="text-gray-600 mb-4">Configure hospital settings and preferences</p>
          <button className="btn-primary w-full">Manage Settings</button>
        </div>

        {user?.role === 'admin' && (
          <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Create Doctor</h3>
            </div>
            <p className="text-gray-600 mb-4">Add new doctors to the system</p>
            <button className="btn-primary w-full">Create Doctor</button>
          </div>
        )}

        {user?.role === 'administrator' && (
          <div className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Create Admin</h3>
            </div>
            <p className="text-gray-600 mb-4">Add new administrators to the system</p>
            <button className="btn-primary w-full">Create Admin</button>
          </div>
        )}

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Reports</h3>
          </div>
          <p className="text-gray-600 mb-4">Generate comprehensive system reports</p>
          <button className="btn-primary w-full">View Reports</button>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-3">Security</h3>
          </div>
          <p className="text-gray-600 mb-4">Manage system security and access logs</p>
          <button className="btn-primary w-full">Security Settings</button>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Administrator Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Role</label>
            <p className="text-gray-900 capitalize">
              {user?.role === 'administrator' ? 'Super Administrator' : 'Hospital Administrator'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Department</label>
            <p className="text-gray-900">{user?.department || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Contact</label>
            <p className="text-gray-900">{user?.contactInfo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Access Level</label>
            <p className="text-gray-900">
              {user?.role === 'administrator' ? 'Full System Access' : 'Hospital Management'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;