import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * API Service Factory - Follows Open/Closed Principle
 * New API domains can be added without modifying existing code
 */

// Base API Configuration
class APIClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor - Add token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
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
  }

  get(url, config) {
    return this.client.get(url, config);
  }

  post(url, data, config) {
    return this.client.post(url, data, config);
  }

  put(url, data, config) {
    return this.client.put(url, data, config);
  }

  delete(url, config) {
    return this.client.delete(url, config);
  }
}

// Create API client instance
const apiClient = new APIClient(API_BASE_URL);

/**
 * Resource API Factory
 * Makes it easy to create new API endpoints following a pattern
 */
class ResourceAPI {
  constructor(client, resource) {
    this.client = client;
    this.resource = resource;
  }

  getAll(params) {
    return this.client.get(`/${this.resource}`, { params });
  }

  getOne(id) {
    return this.client.get(`/${this.resource}/${id}`);
  }

  create(data) {
    return this.client.post(`/${this.resource}`, data);
  }

  update(id, data) {
    return this.client.put(`/${this.resource}/${id}`, data);
  }

  delete(id) {
    return this.client.delete(`/${this.resource}/${id}`);
  }

  // Custom endpoint helper
  custom(endpoint, method = 'get', data = null, config = {}) {
    const url = `/${this.resource}/${endpoint}`;
    switch (method.toLowerCase()) {
      case 'post':
        return this.client.post(url, data, config);
      case 'put':
        return this.client.put(url, data, config);
      case 'delete':
        return this.client.delete(url, config);
      default:
        return this.client.get(url, config);
    }
  }
}

// Auth API - Custom implementation
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
};

// Patient API - Using ResourceAPI with custom methods
class PatientAPI extends ResourceAPI {
  constructor(client) {
    super(client, 'patients');
  }

  register(patientData) {
    return this.custom('register', 'post', patientData);
  }

  getAllPatients() {
    return this.getAll();
  }

  getPatient(patientId) {
    return this.getOne(patientId);
  }

  updatePatient(patientId, patientData) {
    return this.update(patientId, patientData);
  }

  deletePatient(patientId) {
    return this.delete(patientId);
  }

  getHealthCard(patientId) {
    return this.client.get(`/patients/${patientId}/health-card`);
  }
}

// Analytics API
class AnalyticsAPI extends ResourceAPI {
  constructor(client) {
    super(client, 'analytics');
  }

  getDashboardStats() {
    return this.custom('dashboard', 'get');
  }

  getPatientFlow(params) {
    return this.custom('patient-flow', 'get', null, { params });
  }

  getAppointmentStats(params) {
    return this.custom('appointments', 'get', null, { params });
  }

  getPaymentStats(params) {
    return this.custom('payments', 'get', null, { params });
  }

  getPeakTimes(params) {
    return this.custom('peak-times', 'get', null, { params });
  }

  exportReport(params) {
    return this.custom('export', 'get', null, { params });
  }
}

// Medical Record API
class MedicalRecordAPI extends ResourceAPI {
  constructor(client) {
    super(client, 'medical-records');
  }

  searchByHealthCardID(cardID) {
    return this.custom('scan', 'post', { cardID });
  }

  searchPatientByNIC(nicNumber) {
    return this.client.get(`/medical-records/search/${nicNumber}`);
  }

  getMedicalHistory(patientId) {
    return this.client.get(`/medical-records/patient/${patientId}`);
  }

  getPatientMedicalHistory(patientId) {
    return this.getMedicalHistory(patientId);
  }

  addVisitRecord(visitData) {
    return this.create(visitData);
  }
}

// Export API instances
export const patientAPI = new PatientAPI(apiClient);
export const analyticsAPI = new AnalyticsAPI(apiClient);
export const medicalRecordAPI = new MedicalRecordAPI(apiClient);

// Export base client for custom use
export default apiClient;