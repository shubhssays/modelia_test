import { generationService } from '../../services/generationService';
import { generationRepository } from '../../repositories/generationRepository';
import { ClientError } from '../../errors';
import fs from 'fs';
import type { Generation, NewGeneration } from '../../db/schema';

jest.mock('../../repositories/generationRepository');
jest.mock('fs');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Generation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFs.unlinkSync = jest.fn();
    mockFs.copyFileSync = jest.fn();
  });

  describe('createGeneration', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'image',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024,
      destination: '/uploads/1',
      filename: 'img_123456789.jpg',
      path: '/uploads/1/img_123456789.jpg',
      buffer: Buffer.from(''),
      stream: null as any,
    };

    it('should create generation successfully', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // > 0.2, no error

      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Test prompt',
        style: 'casual',
        imageUrl: '/v1/files/1/img_123456789.jpg',
        resultUrl: '/v1/files/1/result_123456789.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationRepository.create as jest.Mock).mockResolvedValue(mockGeneration);

      const result = await generationService.createGeneration(1, 'Test prompt', 'casual', mockFile);

      expect(result).toEqual(mockGeneration);
      expect(mockFs.copyFileSync).toHaveBeenCalled();
      expect(generationRepository.create).toHaveBeenCalled();

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should throw ClientError when model is overloaded (20% chance)', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.2, triggers error

      await expect(
        generationService.createGeneration(1, 'Test prompt', 'casual', mockFile)
      ).rejects.toThrow(ClientError);

      expect(mockFs.unlinkSync).toHaveBeenCalledWith(mockFile.path);
      expect(generationRepository.create).not.toHaveBeenCalled();

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should generate correct file URLs', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Test',
        style: 'casual',
        imageUrl: '/v1/files/1/img_123456789.jpg',
        resultUrl: '/v1/files/1/result_123456789.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationRepository.create as jest.Mock).mockImplementation((data: NewGeneration) => {
        expect(data.imageUrl).toMatch(/^\/files\/1\//);
        expect(data.resultUrl).toMatch(/^\/files\/1\//);
        return Promise.resolve(mockGeneration);
      });

      await generationService.createGeneration(1, 'Test', 'casual', mockFile);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should simulate delay between 1-2 seconds', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      const startTime = Date.now();

      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Test',
        style: 'casual',
        imageUrl: '/v1/files/1/img_123456789.jpg',
        resultUrl: '/v1/files/1/result_123456789.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationRepository.create as jest.Mock).mockResolvedValue(mockGeneration);

      await generationService.createGeneration(1, 'Test', 'casual', mockFile);

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(1000);
      expect(elapsed).toBeLessThan(3000);

      jest.spyOn(Math, 'random').mockRestore();
    });

    it('should copy uploaded file to create result file', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Test',
        style: 'casual',
        imageUrl: '/v1/files/1/img_123456789.jpg',
        resultUrl: '/v1/files/1/result_123456789.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationRepository.create as jest.Mock).mockResolvedValue(mockGeneration);

      await generationService.createGeneration(1, 'Test', 'casual', mockFile);

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        mockFile.path,
        expect.stringContaining('result_')
      );

      jest.spyOn(Math, 'random').mockRestore();
    });
  });

  describe('getRecentGenerations', () => {
    it('should return recent generations with default limit', async () => {
      const mockGenerations: Generation[] = [
        {
          id: 1,
          userId: 1,
          prompt: 'First',
          style: 'casual',
          imageUrl: '/v1/files/1/img_1.jpg',
          resultUrl: '/v1/files/1/result_1.jpg',
          status: 'completed',
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          prompt: 'Second',
          style: 'formal',
          imageUrl: '/v1/files/1/img_2.jpg',
          resultUrl: '/v1/files/1/result_2.jpg',
          status: 'completed',
          createdAt: new Date(),
        },
      ];

      (generationRepository.findByUserId as jest.Mock).mockResolvedValue(mockGenerations);

      const result = await generationService.getRecentGenerations(1);

      expect(result).toEqual(mockGenerations);
      expect(generationRepository.findByUserId).toHaveBeenCalledWith(1, 5);
    });

    it('should return recent generations with custom limit', async () => {
      const mockGenerations: Generation[] = [];

      (generationRepository.findByUserId as jest.Mock).mockResolvedValue(mockGenerations);

      await generationService.getRecentGenerations(1, 10);

      expect(generationRepository.findByUserId).toHaveBeenCalledWith(1, 10);
    });

    it('should return empty array when no generations exist', async () => {
      (generationRepository.findByUserId as jest.Mock).mockResolvedValue([]);

      const result = await generationService.getRecentGenerations(1);

      expect(result).toEqual([]);
    });
  });

  describe('getGenerationById', () => {
    it('should return generation by id', async () => {
      const mockGeneration: Generation = {
        id: 1,
        userId: 1,
        prompt: 'Test',
        style: 'casual',
        imageUrl: '/v1/files/1/img_1.jpg',
        resultUrl: '/v1/files/1/result_1.jpg',
        status: 'completed',
        createdAt: new Date(),
      };

      (generationRepository.findById as jest.Mock).mockResolvedValue(mockGeneration);

      const result = await generationService.getGenerationById(1);

      expect(result).toEqual(mockGeneration);
      expect(generationRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should return undefined when generation not found', async () => {
      (generationRepository.findById as jest.Mock).mockResolvedValue(undefined);

      const result = await generationService.getGenerationById(999);

      expect(result).toBeUndefined();
    });
  });
});
