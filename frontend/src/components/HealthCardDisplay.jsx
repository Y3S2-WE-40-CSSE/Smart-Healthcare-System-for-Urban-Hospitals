import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const HealthCardDisplay = () => {
  const { user } = useAuth();
  const [healthCard, setHealthCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthCard();
  }, [user]);

  const fetchHealthCard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/patients/${user._id}/health-card`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setHealthCard(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to load health card');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>⚠️ {error}</p>
      </div>
    );
  }

  if (!healthCard) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>No health card found for your account.</p>
      </div>
    );
  }

  const patient = healthCard.patientID;
  const isExpired = new Date(healthCard.expiryDate) < new Date();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Digital Health Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl p-8 text-white mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Digital Health Card</h2>
            <p className="text-blue-100 text-sm">Smart Healthcare System</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isExpired ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {isExpired ? 'EXPIRED' : 'ACTIVE'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-blue-200 text-xs mb-1">Patient Name</p>
            <p className="font-semibold text-lg">{patient.name}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">Card ID</p>
            <p className="font-mono font-semibold">{healthCard.cardID}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">Patient ID</p>
            <p className="font-mono text-sm">{patient._id}</p>
          </div>
          <div>
            <p className="text-blue-200 text-xs mb-1">Blood Group</p>
            <p className="font-semibold text-lg">{patient.bloodGroup || 'Unknown'}</p>
          </div>
        </div>

        <div className="border-t border-blue-400 pt-4 mb-6">
          <p className="text-blue-200 text-xs mb-2">Date of Birth</p>
          <p className="font-semibold">{new Date(patient.DOB).toLocaleDateString()}</p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-blue-200 text-xs mb-1">Issued</p>
            <p className="text-sm">{new Date(healthCard.issuedDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs mb-1">Expires</p>
            <p className="text-sm">{new Date(healthCard.expiryDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      {healthCard.QRCode && healthCard.QRCode !== 'PENDING' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Scan QR Code for Quick Check-in
          </h3>
          <div className="flex justify-center">
            <img 
              src={healthCard.QRCode} 
              alt="Health Card QR Code"
              className="w-64 h-64 border-4 border-gray-200 rounded-lg"
            />
          </div>
          {healthCard.barcode && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">Barcode</p>
              <p className="font-mono text-lg font-semibold">{healthCard.barcode}</p>
            </div>
          )}
        </div>
      )}

      {/* Patient Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Contact</label>
            <p className="text-gray-900">{patient.contactInfo}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900">{patient.email}</p>
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-500">Allergies</label>
            <p className="text-gray-900">{patient.allergies || 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCardDisplay;