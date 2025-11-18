import request from 'supertest';
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRoutes from '../../routes/auth';
import { errorHandler } from '../../middleware/errorHandler';
import type { User } from '../../db/schema';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock the userRepository
jest.mock('../../repositories/userRepository', () => ({
  userRepository: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    existsByEmail: jest.fn(),
  },
}));

// Import after mock
import { userRepository } from '../../repositories/userRepository';

// Create test app
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler);

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    const validSignupData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create a new user and return token', async () => {
      const mockUser: User = {
        id: 1,
        email: validSignupData.email,
        name: validSignupData.name,
        password: 'hashed_password',
        createdAt: new Date(),
      };

      mockBcrypt.hash = jest.fn().mockResolvedValue('hashed_password' as never);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/signup')
        .send(validSignupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(
        response.body.data.token,
        process.env.JWT_SECRET!
      ) as { id: number; email: string };
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should return 409 if user already exists', async () => {
      const existingUser: User = {
        id: 1,
        email: validSignupData.email,
        name: 'Existing User',
        password: 'hashedpassword',
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      const response = await request(app)
        .post('/auth/signup')
        .send(validSignupData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should return 422 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ ...validSignupData, email: 'invalid-email' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
      expect(response.body.error.errors).toBeDefined();
    });

    it('should return 422 for short password', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ ...validSignupData, password: '12345' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 422 for missing name', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ email: validSignupData.email, password: validSignupData.password })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 422 for empty name', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ ...validSignupData, name: '' })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      (userRepository.findByEmail as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .post('/auth/signup')
        .send(validSignupData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with correct credentials', async () => {
      const mockUser: User = {
        id: 1,
        email: validLoginData.email,
        name: 'Test User',
        password: 'hashed_password',
        createdAt: new Date(),
      };

      mockBcrypt.compare = jest.fn().mockResolvedValue(true as never);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(
        response.body.data.token,
        process.env.JWT_SECRET!
      ) as { id: number; email: string };
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should return 401 for non-existent user', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should return 401 for incorrect password', async () => {
      const mockUser: User = {
        id: 1,
        email: validLoginData.email,
        name: 'Test User',
        password: 'hashed_different_password',
        createdAt: new Date(),
      };

      mockBcrypt.compare = jest.fn().mockResolvedValue(false as never);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid credentials');
    });

    it('should return 422 for invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'not-an-email', password: validLoginData.password })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 422 for missing password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: validLoginData.email })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should return 422 for missing email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ password: validLoginData.password })
        .expect(422);

      expect(response.body.success).toBe(false);
    });

    it('should handle database errors during login', async () => {
      (userRepository.findByEmail as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/auth/login')
        .send(validLoginData)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
