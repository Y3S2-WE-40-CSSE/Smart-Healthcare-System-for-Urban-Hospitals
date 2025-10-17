const request = require('supertest');
const app = require('../../app');
const { connectTestDB, disconnectTestDB, clearTestDB } = require('../helpers/testHelpers');
const User = require('../../models/userModel');

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new patient successfully', async () => {
      // Arrange
      const userData = {
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'Password123',
        contactInfo: '1234567890',
        role: 'patient',
        DOB: '1990-01-01',
        address: '123 Test Street'
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: 'patient'
      });
      expect(response.body.data.token).toBeDefined();
      
      // Verify user in database
      const userInDb = await User.findOne({ email: userData.email });
      expect(userInDb).toBeDefined();
      expect(userInDb.name).toBe(userData.name);
    });

    test('should reject registration with duplicate email', async () => {
      // Arrange
      const userData = {
        name: 'Test User',
        email: 'duplicate@test.com',
        password: 'Password123',
        contactInfo: '1234567890',
        role: 'patient',
        DOB: '1990-01-01',
        address: '123 Test Street'
      };

      // Create first user
      await request(app).post('/api/auth/register').send(userData);

      // Act - Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should validate required fields', async () => {
      // Arrange
      const incompleteData = {
        email: 'test@test.com'
        // Missing required fields
      };

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create({
        name: 'Test User',
        email: 'test@login.com',
        password: 'Password123',
        role: 'patient',
        contactInfo: '1234567890',
        DOB: '1990-01-01',
        address: '123 Test Street'
      });
    });

    test('should login with valid credentials', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@login.com',
          password: 'Password123'
        })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@login.com');
      expect(response.body.data.token).toBeDefined();
    });

    test('should reject login with wrong password', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@login.com',
          password: 'WrongPassword'
        })
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject login with non-existent email', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123'
        })
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeEach(async () => {
      // Register and login to get token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Auth Test User',
          email: 'authtest@test.com',
          password: 'Password123',
          contactInfo: '1234567890',
          role: 'patient',
          DOB: '1990-01-01',
          address: '123 Test Street'
        });
      
      authToken = response.body.data.token;
    });

    test('should get user profile with valid token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('authtest@test.com');
    });

    test('should reject request without token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid token', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      // Assert
      expect(response.body.success).toBe(false);
    });
  });
});