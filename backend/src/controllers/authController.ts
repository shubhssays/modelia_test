import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';

export const authController = {
  signup: async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;
    const result = await authService.signup(email, password, name);
    sendSuccess(res, result, 'User created successfully', HTTP_STATUS.CREATED);
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 'Login successful');
  },
};

