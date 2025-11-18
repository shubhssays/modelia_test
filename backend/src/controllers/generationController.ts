import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generationService } from '../services/generationService';
import { generationSchema } from '../utils/validation';

export const generationController = {
  async createGeneration(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ message: 'Image file is required' });
        return;
      }

      const validatedData = generationSchema.parse({
        prompt: req.body.prompt,
        style: req.body.style,
      });

      const generation = await generationService.createGeneration(
        req.user.id,
        validatedData.prompt,
        validatedData.style,
        req.file
      );

      res.status(200).json(generation);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Model overloaded') {
          res.status(503).json({ message: 'Model overloaded. Please try again.' });
        } else {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  async getGenerations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 5;
      const generations = await generationService.getRecentGenerations(req.user.id, limit);

      res.status(200).json({ generations });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
};
