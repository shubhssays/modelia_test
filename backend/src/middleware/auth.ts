import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { UnauthorizedError } from '../errors';

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const decoded = await authService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate from URL query parameter (for file downloads)
 * Accepts token as ?token=xxx in the URL
 */
export const authenticateFromQuery = async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    // Try to get token from query parameter first
    let token = req.query.authorization as string | undefined;

    // Fallback to Authorization header if no query token
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = await authService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

