import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { signupSchema, loginSchema } from '../utils/validation';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = signupSchema.parse(req.body);
      const result = await authService.signup(
        validatedData.email,
        validatedData.password,
        validatedData.name
      );
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          res.status(409).json({ message: error.message });
        } else {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(
        validatedData.email,
        validatedData.password
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({ message: error.message });
        } else {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
};
