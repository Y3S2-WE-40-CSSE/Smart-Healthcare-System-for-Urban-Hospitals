const jwt = require('jsonwebtoken');
const generateToken = require('../../../utils/generateToken');

describe('generateToken Utility', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  // ✅ POSITIVE CASE
  describe('Positive Cases', () => {
    test('should generate a valid JWT token with user id', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRE = '30d';
      const userId = '507f1f77bcf86cd799439011';

      // Act
      const token = generateToken(userId);

      // Assert
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token is valid
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userId);
    });

    test('should use default expiry when JWT_EXPIRE is not set', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret';
      delete process.env.JWT_EXPIRE;
      const userId = '507f1f77bcf86cd799439011';

      // Act
      const token = generateToken(userId);

      // Assert
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(userId);
      // Token should have expiry (default 30d)
      expect(decoded.exp).toBeDefined();
    });
  });

  // ❌ NEGATIVE CASE
  describe('Negative Cases', () => {
    test('should throw error when JWT_SECRET is not defined', () => {
      // Arrange
      delete process.env.JWT_SECRET;
      const userId = '507f1f77bcf86cd799439011';

      // Act & Assert
      expect(() => generateToken(userId)).toThrow('JWT_SECRET is not defined');
    });
  });

  // 🔄 EDGE CASES
  describe('Edge Cases', () => {
    test('should handle empty string as userId', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret';

      // Act
      const token = generateToken('');

      // Assert
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('');
    });

    test('should handle special characters in userId', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret';
      const specialId = 'user@123#test';

      // Act
      const token = generateToken(specialId);

      // Assert
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(specialId);
    });
  });
});