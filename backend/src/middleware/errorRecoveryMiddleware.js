const OfflineDataService = require('../services/offlineDataService');

/**
 * Error recovery middleware
 * Catches database connection errors and saves data offline
 */
const handleDatabaseError = (err, req, res, next) => {
  // Check if it's a database connection error
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    // For patient registration, save data offline
    if (req.path.includes('/patients/register') && req.method === 'POST') {
      OfflineDataService.saveOfflinePatientData({
        ...req.body,
        staffId: req.user?._id,
        errorContext: 'database_offline'
      }).then(result => {
        return res.status(503).json({
          success: false,
          message: 'Database temporarily unavailable. Patient data has been saved offline and will be synced when the system is back online.',
          offline: true,
          savedReference: result.filename
        });
      });
    } else {
      return res.status(503).json({
        success: false,
        message: 'Database temporarily unavailable. Please try again later.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }
  } else {
    next(err);
  }
};

module.exports = { handleDatabaseError };