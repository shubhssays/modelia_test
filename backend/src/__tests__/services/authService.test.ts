import { authService } from '../../services/authService';
import { userRepository } from '../../repositories/userRepository';
import { ConflictError, UnauthorizedError } from '../../errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { User } from '../../db/schema';

jest.mock('../../repositories/userRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should create new user successfully', async () => {
      const hashedPassword = 'hashed_password';
      const mockUser: User = {
        id: 1,
        email: signupData.email,
        name: signupData.name,
        password: hashedPassword,
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.signup(
        signupData.email,
        signupData.password,
        signupData.name
      );

      expect(result.token).toBe('mock_token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result.user).not.toHaveProperty('password');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(signupData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(signupData.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        email: signupData.email,
        password: hashedPassword,
        name: signupData.name,
      });
    });

    it('should throw ConflictError if user already exists', async () => {
      const existingUser: User = {
        id: 1,
        email: signupData.email,
        name: 'Existing User',
        password: 'hashed',
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        authService.signup(signupData.email, signupData.password, signupData.name)
      ).rejects.toThrow(ConflictError);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('should generate JWT token with correct payload', async () => {
      const mockUser: User = {
        id: 1,
        email: signupData.email,
        name: signupData.name,
        password: 'hashed',
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      (userRepository.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      await authService.signup(signupData.email, signupData.password, signupData.name);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      const mockUser: User = {
        id: 1,
        email: loginData.email,
        name: 'Test User',
        password: hashedPassword,
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.login(loginData.email, loginData.password);

      expect(result.token).toBe('mock_token');
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result.user).not.toHaveProperty('password');
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    it('should throw UnauthorizedError if user not found', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow(
        UnauthorizedError
      );

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      const mockUser: User = {
        id: 1,
        email: loginData.email,
        name: 'Test User',
        password: 'hashed_password',
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginData.email, loginData.password)).rejects.toThrow(
        UnauthorizedError
      );

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should generate JWT token with correct payload on login', async () => {
      const mockUser: User = {
        id: 1,
        email: loginData.email,
        name: 'Test User',
        password: 'hashed',
        createdAt: new Date(),
      };

      (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      await authService.login(loginData.email, loginData.password);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });
  });
});
