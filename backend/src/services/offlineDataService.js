const fs = require('fs').promises;
const path = require('path');

/**
 * OfflineDataService - Handles offline data storage and sync
 * Follows Single Responsibility Principle
 */
class OfflineDataService {
  constructor() {
    this.offlineDir = path.join(__dirname, '../../offline_data');
    this.ensureOfflineDirectory();
  }

  /**
   * Ensure offline directory exists
   */
  async ensureOfflineDirectory() {
    try {
      await fs.access(this.offlineDir);
    } catch {
      await fs.mkdir(this.offlineDir, { recursive: true });
    }
  }

  /**
   * Save patient data offline
   * @param {Object} patientData - Patient registration data
   * @returns {Promise<Object>} - Save result
   */
  async saveOfflinePatientData(patientData) {
    try {
      const timestamp = Date.now();
      const filename = `patient_${timestamp}.json`;
      const filepath = path.join(this.offlineDir, filename);

      const dataToSave = {
        ...patientData,
        offlineTimestamp: timestamp,
        status: 'pending_sync'
      };

      await fs.writeFile(filepath, JSON.stringify(dataToSave, null, 2));

      return {
        success: true,
        message: 'Data saved offline for later sync',
        filename: filename
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save data offline',
        error: error.message
      };
    }
  }

  /**
   * Get all pending offline data
   * @returns {Promise<Array>} - Array of pending data
   */
  async getPendingOfflineData() {
    try {
      const files = await fs.readdir(this.offlineDir);
      const pendingData = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filepath = path.join(this.offlineDir, file);
          const content = await fs.readFile(filepath, 'utf-8');
          const data = JSON.parse(content);
          
          if (data.status === 'pending_sync') {
            pendingData.push({ ...data, filename: file });
          }
        }
      }

      return pendingData;
    } catch (error) {
      console.error('Failed to get pending offline data:', error);
      return [];
    }
  }

  /**
   * Mark offline data as synced
   * @param {String} filename - Filename to mark as synced
   */
  async markAsSynced(filename) {
    try {
      const filepath = path.join(this.offlineDir, filename);
      await fs.unlink(filepath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new OfflineDataService();