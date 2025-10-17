import React, { useState } from 'react';
import PatientSearchForm from './PatientSearchForm';
import MedicalHistoryViewer from './MedicalHistoryViewer';
import VisitRecordForm from './VisitRecordForm';
import { medicalRecordAPI } from '../services/api';

const PatientVisitWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientData, setPatientData] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // Step 2-3: Patient Found, Verify and Retrieve Records
  const handlePatientFound = async (data) => {
    setPatientData(data.patient);
    setLoading(true);
    
    try {
      // Step 3: Retrieve medical records
      const response = await medicalRecordAPI.getMedicalHistory(data.patient._id);
      
      if (response.data.success) {
        setMedicalHistory(response.data.data);
        setCurrentStep(2); // Move to review step
      } else {
        // Alternate Flow 3: Partial Record Access
        if (response.data.partialData) {
          setMedicalHistory(response.data.partialData);
          showNotification('warning', '⚠️ Some past records are unavailable due to sync delay');
        } else {
          showNotification('warning', '⚠️ Could not fetch complete medical history');
        }
        setCurrentStep(2);
      }
    } catch (err) {
      // Exception Flow 2: Database/System Error
      console.error('Error fetching medical history:', err);
      showNotification('error', '⚠️ Could not fetch medical history, but you can still add new visit');
      setCurrentStep(2); // Still allow new entry
    } finally {
      setLoading(false);
    }
  };

  // Step 6-10: Visit Record Submitted
  const handleVisitRecordSuccess = (recordData) => {
    // Step 9: Confirmation message
    showNotification('success', '✅ Visit record saved successfully!');
    
    // Reset workflow for next patient
    setTimeout(() => {
      resetWorkflow();
    }, 2000);
  };

  const handleVisitRecordError = (error) => {
    // Exception Flow 2: Database/System Error
    showNotification('error', `❌ Error: ${error}`);
  };

  const resetWorkflow = () => {
    setCurrentStep(1);
    setPatientData(null);
    setMedicalHistory(null);
    setNotification({ show: false, type: '', message: '' });
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Banner */}
      {notification.show && (
        <div className="max-w-6xl mx-auto mb-4">
          <div className={`border-l-4 p-4 rounded ${
            notification.type === 'success' ? 'bg-green-50 border-green-400' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
            'bg-red-50 border-red-400'
          }`}>
            <p className={`text-sm ${
              notification.type === 'success' ? 'text-green-700' :
              notification.type === 'warning' ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {['Search Patient', 'Review Records', 'Add Visit Record'].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  ${currentStep > index + 1 ? 'bg-green-600' : 
                    currentStep === index + 1 ? 'bg-blue-600' : 'bg-gray-300'}
                  text-white font-bold text-lg
                `}>
                  {currentStep > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep === index + 1 ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-4 ${
                  currentStep > index + 1 ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-6xl mx-auto">
        {/* Step 1-2: Search Patient */}
        {currentStep === 1 && (
          <PatientSearchForm
            onPatientFound={handlePatientFound}
            onCancel={null}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="card text-center py-12">
            <svg className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Retrieving patient records...</p>
          </div>
        )}

        {/* Step 3-5: Review Records */}
        {currentStep === 2 && patientData && !loading && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Step 4: Patient Demographics & Medical History
            </h2>
            
            {/* Step 4: Display Demographics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6 border border-blue-100">
              <h3 className="font-semibold text-lg mb-4 text-blue-900">Patient Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium text-gray-900">{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {new Date(patientData.DOB).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium text-gray-900">{patientData.bloodGroup || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium text-gray-900">{patientData.contactInfo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIC Number</p>
                  <p className="font-medium text-gray-900">{patientData.nicNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{patientData.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Step 4: Display Medical History */}
            {medicalHistory && (
              <div className="mb-6">
                <MedicalHistoryViewer 
                  medicalHistory={medicalHistory}
                  patient={patientData}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={resetWorkflow}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back to Search
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center"
              >
                Add Visit Record
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 6-9: Add Visit Record */}
        {currentStep === 3 && patientData && (
          <VisitRecordForm
            patient={patientData}
            onSuccess={handleVisitRecordSuccess}
            onError={handleVisitRecordError}
            onCancel={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default PatientVisitWorkflow;