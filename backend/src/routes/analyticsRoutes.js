const express = require('express');
const {
  getPatientFlowStats,
  getAppointmentStats,
  getPaymentStats,
  getPeakTimesAnalysis,
  getDashboardStats,
  exportReport
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All analytics routes are admin/administrator only
router.use(protect);
router.use(authorize('admin', 'administrator'));

// Analytics endpoints
router.get('/patient-flow', getPatientFlowStats);
router.get('/appointments', getAppointmentStats);
router.get('/payments', getPaymentStats);
router.get('/peak-times', getPeakTimesAnalysis);
router.get('/dashboard', getDashboardStats);
router.get('/export', exportReport);

module.exports = router;