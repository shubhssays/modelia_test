import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import fileRoutes from '../../routes/files';
import { errorHandler } from '../../middleware/errorHandler';

// Mock bcrypt to avoid native module issues in Jest
jest.mock('bcrypt');

// Mock auth service
jest.mock('../../services/authService', () => ({
  authService: {
    verifyToken: jest.fn(),
  },
}));

import { authService } from '../../services/authService';

// Create test app
const app = express();
app.use(express.json());
app.use('/files', fileRoutes);
app.use(errorHandler);

describe('File API', () => {
  const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
  const testUploadsDir = path.join(process.cwd(), 'uploads', '1');
  const testFilePath = path.join(testUploadsDir, 'test.jpg');

  beforeAll(() => {
    // Create test uploads directory and file
    if (!fs.existsSync(testUploadsDir)) {
      fs.mkdirSync(testUploadsDir, { recursive: true });
    }
    fs.writeFileSync(testFilePath, 'test content');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth service to return valid user
    (authService.verifyToken as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
  });

  afterAll(() => {
    // Cleanup test files
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    if (fs.existsSync(testUploadsDir)) {
      fs.rmdirSync(testUploadsDir, { recursive: true });
    }
  });

  describe('GET /files/:userId/:filename', () => {
    it('should serve file for authenticated user accessing their own file', async () => {
      const userId = '1';
      const filename = 'test.jpg';

      const response = await request(app)
        .get(`/files/${userId}/${filename}`)
        .set('Authorization', `Bearer ${validToken}`);

      if (response.status !== 200) {
        // eslint-disable-next-line no-console
        console.log('Error:', response.body);
      }

      expect(response.status).toBe(200);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/files/1/img_123.jpg')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 for invalid file path outside uploads directory', async () => {
      const userId = '1';
      const filename = 'test.jpg';

      // Mock a path that's outside the uploads directory
      jest.spyOn(path, 'join').mockReturnValueOnce('/etc/passwd');

      const response = await request(app)
        .get(`/files/${userId}/${filename}`)
        .set('Authorization', `Bearer ${validToken}`);

      // Path validation should catch this
      expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});
