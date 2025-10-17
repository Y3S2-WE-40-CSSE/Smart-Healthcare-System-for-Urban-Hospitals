import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';

const PatientManagement = ({ onBack }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientAPI.getAllPatients();
      setPatients(response.data.data.patients || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle delete patient
  const handleDelete = async (patientId, patientName) => {
    if (!window.confirm(`Are you sure you want to delete patient: ${patientName}?\n\nThis will also delete their health card and cannot be undone.`)) {
      return;
    }

    try {
      await patientAPI.deletePatient(patientId);
      alert('Patient deleted successfully');
      fetchPatients(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete patient');
    }
  };

  // Handle edit patient
  const handleEdit = (patient) => {
    setEditingPatient({ ...patient });
  };

  // Handle save edited patient
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    
    try {
      await patientAPI.updatePatient(editingPatient._id, editingPatient);
      alert('Patient updated successfully');
      setEditingPatient(null);
      fetchPatients(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update patient');
    }
  };

  // Filter patients based on search
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contactInfo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Edit Modal
  if (editingPatient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Edit Patient Details</h2>
          <button
            onClick={() => setEditingPatient(null)}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕ Cancel
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="card space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={editingPatient.name || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={editingPatient.email || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info *</label>
              <input
                type="text"
                required
                value={editingPatient.contactInfo || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, contactInfo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={editingPatient.DOB ? new Date(editingPatient.DOB).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, DOB: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
              <input
                type="text"
                value={editingPatient.nicNumber || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, nicNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <select
                value={editingPatient.bloodGroup || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Blood Group</option>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea
                required
                value={editingPatient.address || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <textarea
                value={editingPatient.allergies || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, allergies: e.target.value })}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea
                value={editingPatient.medicalHistory || ''}
                onChange={(e) => setEditingPatient({ ...editingPatient, medicalHistory: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditingPatient(null)}
              className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="card">
        <input
          type="text"
          placeholder="Search patients by name, email, or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading patients...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-red-200 text-red-700">
          <p>{error}</p>
          <button onClick={fetchPatients} className="mt-2 text-red-800 underline">
            Try Again
          </button>
        </div>
      )}

      {/* Patients Table */}
      {!loading && !error && (
        <div className="card overflow-hidden">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Patients: {filteredPatients.length}
            </h3>
          </div>

          {filteredPatients.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blood Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{patient.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{patient.contactInfo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {patient.DOB ? new Date(patient.DOB).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {patient.bloodGroup || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient._id, patient.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
