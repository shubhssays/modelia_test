import { authenticate, type AuthRequest } from '../../middleware/auth';
import { UnauthorizedError } from '../../errors';
import jwt from 'jsonwebtoken';
import type { Response, NextFunction } from 'express';

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should authenticate valid token and attach user to request', async () => {
    const userId = 1;
    const userEmail = 'test@example.com';
    const token = jwt.sign({ id: userId, email: userEmail }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    // JWT payload includes id, email, plus exp and iat from jwt.sign
    expect(mockRequest.user).toMatchObject({ id: userId, email: userEmail });
    expect(mockRequest.user).toHaveProperty('exp');
    expect(mockRequest.user).toHaveProperty('iat');
    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should throw UnauthorizedError when no token provided', async () => {
    mockRequest.headers = {};

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.message).toContain('No token provided');
  });

  it('should throw UnauthorizedError when token is malformed', async () => {
    mockRequest.headers = {
      authorization: 'InvalidFormat',
    };

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should throw UnauthorizedError for invalid token', async () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid.token.here',
    };

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('Unauthorized access');
  });

  it('should throw UnauthorizedError for expired token', async () => {
    const userId = 1;
    const expiredToken = jwt.sign({ id: userId, email: "test@example.com" }, process.env.JWT_SECRET!, { expiresIn: '-1s' });

    mockRequest.headers = {
      authorization: `Bearer ${expiredToken}`,
    };

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should handle token with wrong secret', async () => {
    const userId = 1;
    const wrongToken = jwt.sign({ id: userId, email: "test@example.com" }, 'wrong-secret', { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${wrongToken}`,
    };

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('should NOT accept bearer token with lowercase bearer', async () => {
    const userId = 1;
    const token = jwt.sign({ id: userId, email: "test@example.com" }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `bearer ${token}`,
    };

    await authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.message).toBe('No token provided');
  });
});
