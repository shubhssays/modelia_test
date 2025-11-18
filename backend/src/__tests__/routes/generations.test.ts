import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import generationRoutes from '../../routes/generations';
import { errorHandler } from '../../middleware/errorHandler';
import { UnauthorizedError, ClientError } from '../../errors';
import type { Generation } from '../../db/schema';

// Mock bcrypt to avoid native module issues in Jest
jest.mock('bcrypt');

// Mock multer - use real multer with memory storage for tests
jest.mock('../../middleware/upload', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const multer = require('multer');
  const storage = multer.memoryStorage();
  const upload = multer({ storage });
  
  return { upload };
});

// Mock auth service
jest.mock('../../services/authService', () => ({
  authService: {
    verifyToken: jest.fn(),
  },
}));

// Mock generation service
jest.mock('../../services/generationService', () => ({
  generationService: {
    createGeneration: jest.fn(),
    getRecentGenerations: jest.fn(),
  },
}));

// Import after mock
import { authService } from '../../services/authService';
import { generationService } from '../../services/generationService';

// Mock file system operations
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/generations', generationRoutes);
app.use(errorHandler);

describe('Generation API', () => {
  const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock auth service to return valid user
    (authService.verifyToken as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    
    // Mock fs operations
    mockFs.unlinkSync = jest.fn();
    mockFs.copyFileSync = jest.fn();
    mockFs.existsSync = jest.fn().mockReturnValue(true);
    mockFs.mkdirSync = jest.fn();
  });

  describe('POST /generations', () => {
    beforeEach(() => {
      // Mock Math.random to control error simulation
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.2, so no error
    });

    afterEach(() => {
      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should create generation successfully with valid image', async () => {
      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Transform to vintage style',
        style: 'vintage',
        imageUrl: '/v1/files/1/img_123.jpg',
        resultUrl: '/v1/files/1/result_123.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationService.createGeneration as jest.Mock).mockResolvedValue(mockGeneration);

      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .field('prompt', 'Transform to vintage style')
        .field('style', 'vintage')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: mockGeneration.id,
        prompt: mockGeneration.prompt,
        style: mockGeneration.style,
        imageUrl: mockGeneration.imageUrl,
        resultUrl: mockGeneration.resultUrl,
      });
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/generations')
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      // Mock auth service to reject invalid token
      (authService.verifyToken as jest.Mock).mockRejectedValueOnce(new UnauthorizedError('Invalid token'));

      const response = await request(app)
        .post('/generations')
        .set('Authorization', 'Bearer invalid-token')
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 422 for missing prompt', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .field('style', 'casual')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 422 for invalid style', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .field('prompt', 'Test prompt')
        .field('style', 'invalid-style')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should return 400 for missing image file', async () => {
      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Image file is required');
    });

    it('should simulate model overload error (20% chance)', async () => {
      // Mock service to throw model overload error
      (generationService.createGeneration as jest.Mock).mockRejectedValueOnce(
        new ClientError('Model is currently overloaded', 503)
      );

      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Model is currently overloaded');
    });

    it('should handle valid style options', async () => {
      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Test',
        style: 'formal',
        imageUrl: '/v1/files/1/img_123.jpg',
        resultUrl: '/v1/files/1/result_123.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationService.createGeneration as jest.Mock).mockResolvedValue(mockGeneration);

      const styles = ['casual', 'formal', 'vintage', 'modern', 'streetwear'];

      for (const style of styles) {
        const response = await request(app)
          .post('/generations')
          .set('Authorization', `Bearer ${validToken}`)
          .field('prompt', `Test ${style}`)
          .field('style', style)
          .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
          .expect(201);

        expect(response.body.success).toBe(true);
      }
    });

    it('should handle database errors during creation', async () => {
      (generationService.createGeneration as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .field('prompt', 'Test prompt')
        .field('style', 'casual')
        .attach('image', Buffer.from('fake-image-data'), 'test.jpg')
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /generations', () => {
    it('should return user generations with default limit', async () => {
      const mockGenerations: Generation[] = [
        {
          id: 1,
          userId: 1,
          prompt: 'First generation',
          style: 'casual',
          imageUrl: '/v1/files/1/img_1.jpg',
          resultUrl: '/v1/files/1/result_1.jpg',
          status: 'completed',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          userId: 1,
          prompt: 'Second generation',
          style: 'formal',
          imageUrl: '/v1/files/1/img_2.jpg',
          resultUrl: '/v1/files/1/result_2.jpg',
          status: 'completed',
          createdAt: new Date('2024-01-02'),
        },
      ];

      (generationService.getRecentGenerations as jest.Mock).mockResolvedValue(mockGenerations);

      const response = await request(app)
        .get('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toMatchObject({
        id: 1,
        prompt: 'First generation',
        style: 'casual',
      });
    });

    it('should return user generations with custom limit', async () => {
      const mockGenerations: Generation[] = [
        {
          id: 1,
          userId: 1,
          prompt: 'Generation 1',
          style: 'casual',
          imageUrl: '/v1/files/1/img_1.jpg',
          resultUrl: '/v1/files/1/result_1.jpg',
          status: 'completed',
          createdAt: new Date(),
        },
      ];

      (generationService.getRecentGenerations as jest.Mock).mockResolvedValue([mockGenerations[0]]);

      const response = await request(app)
        .get('/generations?limit=10')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(generationService.getRecentGenerations).toHaveBeenCalledWith(1, 10);
    });

    it('should return empty array when no generations exist', async () => {
      (generationService.getRecentGenerations as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/generations')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should handle invalid limit parameter gracefully', async () => {
      (generationService.getRecentGenerations as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/generations?limit=abc')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should use default limit when invalid
      expect(generationService.getRecentGenerations).toHaveBeenCalled();
    });

    it('should handle database errors during fetch', async () => {
      (generationService.getRecentGenerations as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/generations')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
