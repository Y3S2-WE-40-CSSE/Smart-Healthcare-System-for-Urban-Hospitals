const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const ValidationService = require('../services/validationService');
const ErrorHandlerService = require('../services/errorHandlerService');
const UserRegistrationService = require('../services/userRegistrationService');

// @desc    Register user (Patient/Staff/Doctor/Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Validate request
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    // Validate role
    const roleValidation = UserRegistrationService.validatePublicRole(req.body.role);
    if (!roleValidation.valid) {
      return res.status(400).json({
        success: false,
        message: roleValidation.message,
        errors: [{
          field: 'role',
          message: roleValidation.message
        }],
        errorsByField: {
          role: roleValidation.message
        }
      });
    }

    // Validate role-specific fields
    const fieldValidation = UserRegistrationService.validateRoleSpecificFields(
      req.body.role || 'patient',
      req.body
    );

    if (!fieldValidation.valid) {
      const errorsByField = fieldValidation.errors.reduce((acc, err) => {
        acc[err.field] = err.message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        errors: fieldValidation.errors,
        errorsByField: errorsByField
      });
    }

    // Check if user exists
    const userExists = await UserRegistrationService.checkUserExists(
      req.body.email,
      req.body.nicNumber
    );

    if (userExists.exists) {
      return res.status(400).json({
        success: false,
        message: userExists.message,
        errors: [{
          field: userExists.field,
          message: userExists.message
        }],
        errorsByField: {
          [userExists.field]: userExists.message
        }
      });
    }

    // Check if license number exists (for doctors)
    if (req.body.role === 'doctor') {
      const licenseExists = await UserRegistrationService.checkLicenseExists(
        req.body.licenseNumber
      );

      if (licenseExists.exists) {
        return res.status(400).json({
          success: false,
          message: licenseExists.message,
          errors: [{
            field: licenseExists.field,
            message: licenseExists.message
          }],
          errorsByField: {
            [licenseExists.field]: licenseExists.message
          }
        });
      }
    }

    // Prepare and create user
    const userData = UserRegistrationService.prepareUserData(req.body);
    const user = await UserRegistrationService.createUser(userData);

    // Create digital health card for patients
    if (user.role === 'patient') {
      await UserRegistrationService.createHealthCard(user._id);
    }

    // Generate token
    const token = generateToken(user._id);

    // Send success response
    const response = ErrorHandlerService.createSuccessResponse(
      'User registered successfully',
      {
        user: user.getPublicProfile(),
        token
      }
    );

    res.status(201).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Registration');
    res.status(500).json(errorResponse);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    // Validate request
    const validation = ValidationService.validateRequest(req);
    if (validation.hasErrors) {
      const errorResponse = ValidationService.createValidationErrorResponse(validation.errors);
      return res.status(400).json(errorResponse);
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: [{
          field: 'email',
          message: 'Invalid email or password'
        }],
        errorsByField: {
          email: 'Invalid email or password'
        }
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.',
        errors: [{
          field: 'general',
          message: 'Account has been deactivated'
        }]
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errors: [{
          field: 'password',
          message: 'Invalid email or password'
        }],
        errorsByField: {
          password: 'Invalid email or password'
        }
      });
    }

    const token = generateToken(user._id);

    const response = ErrorHandlerService.createSuccessResponse(
      'Login successful',
      {
        user: user.getPublicProfile(),
        token
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Login');
    res.status(500).json(errorResponse);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const response = ErrorHandlerService.createSuccessResponse(
      'User retrieved successfully',
      {
        user: user.getPublicProfile()
      }
    );

    res.status(200).json(response);
  } catch (error) {
    const errorResponse = ErrorHandlerService.handleError(error, 'Get user');
    res.status(500).json(errorResponse);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};