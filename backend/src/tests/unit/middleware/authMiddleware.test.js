const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../../../middleware/authMiddleware');
const User = require('../../../models/userModel');

jest.mock('../../../models/userModel');
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('protect middleware', () => {
    // ✅ POSITIVE CASES
    test('should allow access with valid token', async () => {
      // Arrange
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        role: 'patient'
      };
      const token = 'valid.jwt.token';
      
      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue({ id: mockUser._id });
      User.findById.mockResolvedValue(mockUser);

      // Act
      await protect(req, res, next);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    // ❌ NEGATIVE CASES
    test('should reject request without authorization header', async () => {
      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Not authorized')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with malformed token', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat';

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject request with invalid token', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid.token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false
        })
      );
    });

    test('should reject when user not found', async () => {
      // Arrange
      req.headers.authorization = 'Bearer valid.token';
      jwt.verify.mockReturnValue({ id: 'nonexistent' });
      User.findById.mockResolvedValue(null);

      // Act
      await protect(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    // ✅ POSITIVE CASES
    test('should allow access when user has required role', () => {
      // Arrange
      req.user = { role: 'admin' };
      const middleware = authorize('admin', 'doctor');

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should allow access when user has one of multiple required roles', () => {
      // Arrange
      req.user = { role: 'doctor' };
      const middleware = authorize('admin', 'doctor', 'staff');

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });

    // ❌ NEGATIVE CASES
    test('should deny access when user lacks required role', () => {
      // Arrange
      req.user = { role: 'patient', email: 'patient@test.com' };
      const middleware = authorize('admin', 'doctor');

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('not authorized')
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    // 🔄 EDGE CASES
    test('should deny access when user object is missing', () => {
      // Arrange
      req.user = null;
      const middleware = authorize('admin');

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});