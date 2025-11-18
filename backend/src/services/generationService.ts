import path from 'path';
import fs from 'fs';
import { generationRepository } from '../repositories';
import { ClientError } from '../errors';
import { ERROR_MESSAGES, GENERATION_STATUS } from '../utils/constants';
import { getSecureFileUrl, getFilenameFromPath } from '../utils/fileHelper';
import type { NewGeneration, Generation } from '../db/schema';

export class GenerationService {
  async createGeneration(
    userId: number,
    prompt: string,
    style: string,
    imageFile: Express.Multer.File
  ): Promise<Generation> {
    // Simulate 20% chance of "Model overloaded" error
    if (Math.random() < 0.2) {
      // Clean up uploaded file
      fs.unlinkSync(imageFile.path);
      throw new ClientError(ERROR_MESSAGES.MODEL_OVERLOADED, 503);
    }

    // Get filename from the uploaded file path
    const filename = getFilenameFromPath(imageFile.path);
    const imageUrl = getSecureFileUrl(userId, filename);
    
    // Simulate generation delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate result (copy original file with different name for simulation)
    const resultFilename = filename.replace('img_', 'result_');
    const resultPath = path.join(path.dirname(imageFile.path), resultFilename);
    fs.copyFileSync(imageFile.path, resultPath);
    
    const resultUrl = getSecureFileUrl(userId, resultFilename);

    // Save to database with relative paths
    const generationData: NewGeneration = {
      userId,
      prompt,
      style,
      imageUrl, // Secure URL: /files/:userId/:filename
      resultUrl, // Secure URL: /files/:userId/:filename
      status: GENERATION_STATUS.COMPLETED,
    };

    const generation = await generationRepository.create(generationData);
    return generation;
  }

  async getRecentGenerations(userId: number, limit: number = 5): Promise<Generation[]> {
    return generationRepository.findByUserId(userId, limit);
  }

  async getGenerationById(id: number): Promise<Generation | undefined> {
    return generationRepository.findById(id);
  }
}

export const generationService = new GenerationService();

