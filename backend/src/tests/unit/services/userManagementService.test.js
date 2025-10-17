const UserManagementService = require('../../../services/userManagementService');
const User = require('../../../models/userModel');

// Mock the User model
jest.mock('../../../models/userModel');

describe('UserManagementService', () => {
  // Clean up mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserByAdmin', () => {
    // ✅ POSITIVE CASES
    describe('Positive Cases', () => {
      test('should successfully create a doctor with valid data', async () => {
        // Arrange
        const userData = {
          name: 'Dr. John Doe',
          email: 'john.doe@hospital.com',
          password: 'SecurePass123',
          contactInfo: '1234567890',
          department: 'Cardiology',
          specialization: 'Cardiologist',
          licenseNumber: 'LIC123456'
        };
        const creatorId = '507f1f77bcf86cd799439011';

        // Mock findOne to return null (user doesn't exist)
        User.findOne.mockResolvedValue(null);

        // Mock create to return a user with getPublicProfile method
        const mockUser = {
          _id: '507f1f77bcf86cd799439012',
          ...userData,
          role: 'doctor',
          getPublicProfile: jest.fn().mockReturnValue({
            id: '507f1f77bcf86cd799439012',
            name: 'Dr. John Doe',
            email: 'john.doe@hospital.com',
            role: 'doctor'
          })
        };
        User.create.mockResolvedValue(mockUser);

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'doctor',
          creatorId
        );

        // Assert
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.name).toBe('Dr. John Doe');
        
        // Verify User.findOne was called correctly
        expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
        expect(User.findOne).toHaveBeenCalledWith({ licenseNumber: userData.licenseNumber });
        
        // Verify User.create was called with correct data
        expect(User.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: userData.name,
            email: userData.email,
            role: 'doctor',
            department: userData.department,
            specialization: userData.specialization,
            licenseNumber: userData.licenseNumber,
            createdBy: creatorId,
            isSelfRegistered: false
          })
        );
      });

      test('should successfully create an admin without license number', async () => {
        // Arrange
        const userData = {
          name: 'Admin User',
          email: 'admin@hospital.com',
          password: 'AdminPass123',
          contactInfo: '9876543210',
          department: 'Administration'
        };
        const creatorId = '507f1f77bcf86cd799439011';

        User.findOne.mockResolvedValue(null);
        const mockUser = {
          ...userData,
          role: 'admin',
          getPublicProfile: jest.fn().mockReturnValue({
            id: '507f1f77bcf86cd799439013',
            name: 'Admin User',
            email: 'admin@hospital.com',
            role: 'admin'
          })
        };
        User.create.mockResolvedValue(mockUser);

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'admin',
          creatorId
        );

        // Assert
        expect(result.success).toBe(true);
        expect(User.findOne).toHaveBeenCalledTimes(1); // Only email check
      });
    });

    // ❌ NEGATIVE CASES
    describe('Negative Cases', () => {
      test('should fail when user with email already exists', async () => {
        // Arrange
        const userData = {
          name: 'Dr. Jane Doe',
          email: 'existing@hospital.com',
          password: 'Pass123',
          contactInfo: '1234567890',
          department: 'Surgery'
        };

        // Mock findOne to return existing user
        User.findOne.mockResolvedValue({ email: 'existing@hospital.com' });

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'doctor',
          '507f1f77bcf86cd799439011'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toContain('already exists');
        expect(result.errors).toEqual([{
          field: 'email',
          message: 'User already exists with this email'
        }]);
        expect(result.errorsByField).toHaveProperty('email');
        expect(User.create).not.toHaveBeenCalled();
      });

      test('should fail when doctor with license number already exists', async () => {
        // Arrange
        const userData = {
          name: 'Dr. Bob Smith',
          email: 'bob@hospital.com',
          password: 'Pass123',
          contactInfo: '1234567890',
          department: 'Neurology',
          specialization: 'Neurologist',
          licenseNumber: 'LIC999999'
        };

        // First call (email check) returns null, second call (license check) returns existing
        User.findOne
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({ licenseNumber: 'LIC999999' });

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'doctor',
          '507f1f77bcf86cd799439011'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toContain('license number already exists');
        expect(result.errors[0].field).toBe('licenseNumber');
        expect(User.create).not.toHaveBeenCalled();
      });
    });

    // 🔥 ERROR CASES
    describe('Error Cases', () => {
      test('should handle database errors gracefully', async () => {
        // Arrange
        const userData = {
          name: 'Dr. Error',
          email: 'error@hospital.com',
          password: 'Pass123',
          contactInfo: '1234567890',
          department: 'General'
        };

        // Mock database error
        User.findOne.mockRejectedValue(new Error('Database connection failed'));

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'doctor',
          '507f1f77bcf86cd799439011'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.message).toBe('User creation failed');
        expect(result.error).toContain('Database connection failed');
      });

      test('should handle User.create failures', async () => {
        // Arrange
        const userData = {
          name: 'Dr. Create Fail',
          email: 'fail@hospital.com',
          password: 'Pass123',
          contactInfo: '1234567890',
          department: 'General'
        };

        User.findOne.mockResolvedValue(null);
        User.create.mockRejectedValue(new Error('Validation error'));

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'doctor',
          '507f1f77bcf86cd799439011'
        );

        // Assert
        expect(result.success).toBe(false);
        expect(result.error).toContain('Validation error');
      });
    });

    // 🔄 EDGE CASES
    describe('Edge Cases', () => {
      test('should handle missing optional fields', async () => {
        // Arrange
        const minimalUserData = {
          name: 'Dr. Minimal',
          email: 'minimal@hospital.com',
          password: 'Pass123',
          contactInfo: '1234567890',
          department: 'General'
        };

        User.findOne.mockResolvedValue(null);
        const mockUser = {
          ...minimalUserData,
          getPublicProfile: jest.fn().mockReturnValue(minimalUserData)
        };
        User.create.mockResolvedValue(mockUser);

        // Act
        const result = await UserManagementService.createUserByAdmin(
          minimalUserData,
          'doctor',
          '507f1f77bcf86cd799439011'
        );

        // Assert
        expect(result.success).toBe(true);
      });

      test('should handle null creatorId', async () => {
        // Arrange
        const userData = {
          name: 'Dr. No Creator',
          email: 'nocreator@hospital.com',
          password: 'Pass123',
          contactInfo: '1234567890',
          department: 'General'
        };

        User.findOne.mockResolvedValue(null);
        const mockUser = {
          ...userData,
          getPublicProfile: jest.fn().mockReturnValue(userData)
        };
        User.create.mockResolvedValue(mockUser);

        // Act
        const result = await UserManagementService.createUserByAdmin(
          userData,
          'doctor',
          null
        );

        // Assert
        expect(result.success).toBe(true);
        expect(User.create).toHaveBeenCalledWith(
          expect.objectContaining({
            createdBy: null
          })
        );
      });
    });
  });
});