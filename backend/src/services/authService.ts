import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories';
import { ConflictError, UnauthorizedError } from '../errors';
import { ERROR_MESSAGES, JWT_CONFIG } from '../utils/constants';
import type { NewUser, User } from '../db/schema';

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

export class AuthService {
  async signup(email: string, password: string, name: string): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.USER_EXISTS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser: NewUser = {
      email,
      password: hashedPassword,
      name,
    };

    const user = await userRepository.create(newUser);

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: JWT_CONFIG.EXPIRES_IN,
    });
  }

  async verifyToken(token: string): Promise<{ id: number; email: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        id: number;
        email: string;
      };
      return decoded;
    } catch (error) {
      throw new UnauthorizedError(ERROR_MESSAGES.UNAUTHORIZED);
    }
  }
}

export const authService = new AuthService();

