import { validateRequest } from '../../middleware/validateRequest';
import { ValidationError } from '../../errors';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

describe('Validate Request Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should pass validation with valid data', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should throw ValidationError with invalid data', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    mockRequest.body = {
      email: 'invalid-email',
      password: '123',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
    const error = (nextFunction as jest.Mock).mock.calls[0][0];
    expect(error.errors).toBeDefined();
    expect(error.errors.length).toBeGreaterThan(0);
  });

  it('should throw ValidationError for missing required fields', () => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
      name: z.string(),
    });

    mockRequest.body = {
      email: 'test@example.com',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
  });

  it('should validate nested objects', () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number().min(18),
      }),
    });

    mockRequest.body = {
      user: {
        name: 'Test User',
        age: 25,
      },
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should handle array validation', () => {
    const schema = z.object({
      tags: z.array(z.string()).min(1),
    });

    mockRequest.body = {
      tags: ['tag1', 'tag2'],
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });

  it('should reject empty required strings', () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    mockRequest.body = {
      name: '',
    };

    const middleware = validateRequest(schema);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(ValidationError));
  });
});
