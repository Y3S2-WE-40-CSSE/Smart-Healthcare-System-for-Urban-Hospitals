import React, { useState } from 'react';
import { medicalRecordAPI } from '../services/api';

const PatientSearchForm = ({ onPatientFound, onCancel }) => {
  const [searchType, setSearchType] = useState('nic'); // 'nic' or 'cardID'
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (searchType === 'nic') {
        // Search by NIC number
        response = await medicalRecordAPI.searchPatientByNIC(searchValue);
        
        if (response.data.success) {
          onPatientFound({ patient: response.data.data.patient });
        } else {
          setError(response.data.message || 'Patient not found');
        }
      } else {
        // Search by Health Card ID
        response = await medicalRecordAPI.searchByHealthCardID(searchValue);
        
        if (response.data.success) {
          onPatientFound(response.data.data);
        } else {
          setError(response.data.message || 'Invalid health card ID');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      
      // Exception Flow 1: Unregistered Patient
      if (err.response?.status === 404) {
        setError('Patient not found. Please register the patient first.');
        // TODO: Add redirect to patient registration
      } else {
        // Exception Flow 2: Database/System Error
        setError(err.response?.data?.message || 'System error. Please try again or contact support.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Search Patient</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Type Toggle */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            searchType === 'nic'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setSearchType('nic');
            setSearchValue('');
            setError('');
          }}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          Search by NIC
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 font-medium transition-colors ${
            searchType === 'cardID'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => {
            setSearchType('cardID');
            setSearchValue('');
            setError('');
          }}
        >
          <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Search by Health Card ID
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {searchType === 'nic' ? 'NIC / Passport Number' : 'Health Card ID'}
          </label>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            placeholder={
              searchType === 'nic' 
                ? 'Enter NIC or Passport number (e.g., 123456789V)' 
                : 'Enter Health Card ID (e.g., HC1234567890123)'
            }
            required
            autoFocus
          />
          <p className="mt-2 text-sm text-gray-500">
            💡 {searchType === 'nic' 
              ? 'Enter the patient\'s National Identity Card or Passport number' 
              : 'Enter the unique ID from the patient\'s health card'}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !searchValue.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium text-lg transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Patient
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> You can search using either the patient's NIC number or their Health Card ID. Both methods will retrieve the complete patient information and medical history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearchForm;