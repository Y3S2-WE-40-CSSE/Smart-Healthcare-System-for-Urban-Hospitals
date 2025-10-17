import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Patient API calls
export const patientAPI = {
  register: (patientData) => api.post('/patients/register', patientData),
  getAllPatients: () => api.get('/patients'),
  getPatient: (patientId) => api.get(`/patients/${patientId}`),
  updatePatient: (patientId, patientData) => api.put(`/patients/${patientId}`, patientData),
  deletePatient: (patientId) => api.delete(`/patients/${patientId}`),
  getHealthCard: (patientId) => api.get(`/patients/${patientId}/health-card`),
};

// ADD THIS NEW SECTION - Medical Record API calls
export const medicalRecordAPI = {
  // Scan health card (QR/Barcode)
  searchByHealthCardID: (cardID) => api.post('/medical-records/scan', { cardID }),
  
  // Search patient by NIC (manual fallback)
  searchPatientByNIC: (nicNumber) => api.get(`/medical-records/search/${nicNumber}`),
  
  // Get patient medical history
  getMedicalHistory: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  getPatientMedicalHistory: (patientId) => api.get(`/medical-records/patient/${patientId}`),
  
  // Add new visit record
  addVisitRecord: (visitData) => api.post('/medical-records', visitData),
};

export default api;
