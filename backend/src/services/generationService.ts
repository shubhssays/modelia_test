import db from '../models/database';
import path from 'path';
import fs from 'fs';

export interface Generation {
  id: number;
  userId: number;
  prompt: string;
  style: string;
  imageUrl: string;
  resultUrl: string | null;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export const generationService = {
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
      throw new Error('Model overloaded');
    }

    const imageUrl = `/uploads/${imageFile.filename}`;
    
    // Simulate generation delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Generate result (copy original file with different name for simulation)
    const resultFilename = imageFile.filename.replace('original_', 'generated_');
    const resultPath = path.join(path.dirname(imageFile.path), resultFilename);
    fs.copyFileSync(imageFile.path, resultPath);
    
    const resultUrl = `/uploads/${resultFilename}`;

    // Save to database
    const generationId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO generations (user_id, prompt, style, image_url, result_url, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, prompt, style, imageUrl, resultUrl, 'completed'],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    return {
      id: generationId,
      userId,
      prompt,
      style,
      imageUrl,
      resultUrl,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
  },

  async getRecentGenerations(userId: number, limit: number = 5): Promise<Generation[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, user_id as userId, prompt, style, image_url as imageUrl, 
                result_url as resultUrl, status, created_at as createdAt 
         FROM generations 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit],
        (err, rows: Generation[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }
};
