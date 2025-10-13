import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PatientDashboard from './dashboards/PatientDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      patient: 'Patient',
      staff: 'Hospital Staff',
      doctor: 'Doctor',
      admin: 'Administrator',
      administrator: 'Super Administrator'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      patient: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
      doctor: 'bg-purple-100 text-purple-800',
      admin: 'bg-red-100 text-red-800',
      administrator: 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'patient':
        return <PatientDashboard />;
      case 'staff':
        return <StaffDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'admin':
      case 'administrator':
        return <AdminDashboard />;
      default:
        return <div className="text-center text-gray-500">Role not recognized</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Smart Healthcare System
                </h1>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                {getRoleDisplayName(user?.role)}
              </span>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderDashboardContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
