import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generationService } from '../services/generationService';
import { sendSuccess } from '../utils/response';
import { ClientError } from '../errors';
import { HTTP_STATUS } from '../utils/constants';

export const generationController = {
  createGeneration: async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ClientError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    if (!req.file) {
      throw new ClientError('Image file is required');
    }

    const { prompt, style } = req.body;
    const generation = await generationService.createGeneration(
      req.user.id,
      prompt,
      style,
      req.file
    );

    sendSuccess(res, generation, 'Generation created successfully');
  },

  getGenerations: async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ClientError('Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    const limit = parseInt(req.query.limit as string) || 5;
    const generations = await generationService.getRecentGenerations(req.user.id, limit);

    sendSuccess(res, generations);
  },
};

