import React from 'react';

const MedicalHistoryViewer = ({ medicalHistory, patient }) => {
  // ✅ NOW USING THE PROPS DIRECTLY - NO EXTRA FETCHING!
  
  if (!medicalHistory || !patient) {
    return (
      <div className="card">
        <div className="text-center text-gray-600 py-8">
          <p>No medical history available</p>
        </div>
      </div>
    );
  }

  const { demographics, medicalInfo, records } = medicalHistory;

  return (
    <div className="space-y-4">
      {/* Medical Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Allergies
          </h3>
          {demographics?.allergies && demographics.allergies !== 'None' ? (
            <p className="text-gray-700">{demographics.allergies}</p>
          ) : (
            <p className="text-gray-500 italic">No known allergies</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Total Visits
          </h3>
          <p className="text-3xl font-bold text-blue-600">{medicalInfo?.totalVisits || 0}</p>
        </div>
      </div>

      {/* Medical History */}
      {demographics?.medicalHistory && demographics.medicalHistory !== 'No significant medical history' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical History</h3>
          <p className="text-gray-700">{demographics.medicalHistory}</p>
        </div>
      )}

      {/* Visit Records */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Visit History ({records?.length || 0} records)
        </h3>

        {records && records.length > 0 ? (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Visit Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(record.visitDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Doctor</p>
                    <p className="font-semibold text-gray-900">{record.doctorID?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{record.doctorID?.department || ''}</p>
                  </div>
                </div>

                {record.symptoms && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                    <p className="text-gray-600">{record.symptoms}</p>
                  </div>
                )}

                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                  <p className="text-gray-900 font-semibold">{record.diagnosis}</p>
                </div>

                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">Treatment Notes:</p>
                  <p className="text-gray-600">{record.treatmentNotes}</p>
                </div>

                {record.prescriptions && record.prescriptions.length > 0 && (
                  <div className="mt-3 bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-gray-700 mb-2">Prescriptions:</p>
                    <div className="space-y-2">
                      {record.prescriptions.map((prescription, index) => (
                        <div key={index} className="text-sm text-gray-700">
                          <span className="font-semibold">{prescription.medication}</span>
                          {prescription.dosage && ` - ${prescription.dosage}`}
                          {prescription.frequency && ` | ${prescription.frequency}`}
                          {prescription.duration && ` | ${prescription.duration}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No visit records found for this patient</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryViewer;