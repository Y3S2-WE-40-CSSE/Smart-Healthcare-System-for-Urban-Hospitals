/**
 * StorageService - Abstraction for storage operations
 * Follows Dependency Inversion Principle
 * Can be easily switched between localStorage, sessionStorage, or custom implementation
 */
class StorageService {
  constructor(storage = localStorage) {
    this.storage = storage;
  }

  getItem(key) {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  setItem(key, value) {
    try {
      this.storage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      return false;
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      return false;
    }
  }

  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Convenience methods for JSON
  getJSON(key) {
    const item = this.getItem(key);
    if (!item) return null;
    
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing JSON for ${key}:`, error);
      return null;
    }
  }

  setJSON(key, value) {
    try {
      const jsonString = JSON.stringify(value);
      return this.setItem(key, jsonString);
    } catch (error) {
      console.error(`Error stringifying JSON for ${key}:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const localStorageService = new StorageService(localStorage);
export const sessionStorageService = new StorageService(sessionStorage);

export default localStorageService;
