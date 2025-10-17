import React, { useState } from 'react';
import { medicalRecordAPI } from '../services/api';

const VisitRecordForm = ({ patient, onSuccess, onCancel, onError }) => {
  const [formData, setFormData] = useState({
    patientID: patient._id,
    symptoms: '',
    diagnosis: '',
    treatmentNotes: '',
    prescriptions: []
  });

  const [currentPrescription, setCurrentPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setCurrentPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPrescription = () => {
    if (currentPrescription.medication && currentPrescription.dosage) {
      setFormData(prev => ({
        ...prev,
        prescriptions: [...prev.prescriptions, currentPrescription]
      }));
      setCurrentPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: ''
      });
    }
  };

  const removePrescription = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await medicalRecordAPI.addVisitRecord(formData);
      
      if (response.data.success) {
        onSuccess(response.data.data);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error adding visit record';
      setError(errorMsg);
      
      // Call onError if provided
      if (onError) {
        onError(errorMsg);
      }
      
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Add Visit Record</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Patient Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p className="font-semibold text-gray-900">{patient.name}</p>
            <p className="text-sm text-gray-600">
              DOB: {new Date(patient.DOB).toLocaleDateString()} | 
              Blood Group: {patient.bloodGroup || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms *
          </label>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe patient symptoms..."
            required
          />
        </div>

        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Diagnosis *
          </label>
          <input
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter diagnosis..."
            required
          />
        </div>

        {/* Treatment Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Treatment Notes *
          </label>
          <textarea
            name="treatmentNotes"
            value={formData.treatmentNotes}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter treatment plan and recommendations..."
            required
          />
        </div>

        {/* Prescriptions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prescriptions</h3>
          
          {/* Current Prescriptions List */}
          {formData.prescriptions.length > 0 && (
            <div className="mb-4 space-y-2">
              {formData.prescriptions.map((prescription, index) => (
                <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{prescription.medication}</p>
                    <p className="text-sm text-gray-600">
                      {prescription.dosage} | {prescription.frequency} | {prescription.duration}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrescription(index)}
                    className="text-red-500 hover:text-red-700 ml-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Prescription Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  name="medication"
                  value={currentPrescription.medication}
                  onChange={handlePrescriptionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Paracetamol"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={currentPrescription.dosage}
                  onChange={handlePrescriptionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={currentPrescription.frequency}
                  onChange={handlePrescriptionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={currentPrescription.duration}
                  onChange={handlePrescriptionChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 days"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addPrescription}
              disabled={!currentPrescription.medication || !currentPrescription.dosage}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Prescription
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Save Visit Record
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitRecordForm;