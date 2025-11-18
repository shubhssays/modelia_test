import { errorHandler } from '../../middleware/errorHandler';
import {
  AppError,
  ClientError,
  ValidationError,
  ServerError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../../errors';
import type { Request, Response, NextFunction } from 'express';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
    nextFunction = jest.fn();
  });

  it('should handle ValidationError with 422 status', () => {
    const errors = [
      { path: ['email'], message: 'Invalid email' },
      { path: ['password'], message: 'Password too short' },
    ];
    const error = new ValidationError(errors);

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(422);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Validation failed',
        errors: errors,
      },
    });
  });

  it('should handle UnauthorizedError with 401 status', () => {
    const error = new UnauthorizedError('Invalid credentials');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Invalid credentials',
      },
    });
  });

  it('should handle NotFoundError with 404 status', () => {
    const error = new NotFoundError('Resource not found');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Resource not found',
      },
    });
  });

  it('should handle ConflictError with 409 status', () => {
    const error = new ConflictError('Resource already exists');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(409);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Resource already exists',
      },
    });
  });

  it('should handle ForbiddenError with 403 status', () => {
    const error = new ForbiddenError('Access denied');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Access denied',
      },
    });
  });

  it('should handle ClientError with custom status', () => {
    const error = new ClientError('Bad request', 400);

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Bad request',
      },
    });
  });

  it('should handle ServerError with isOperational false', () => {
    const error = new ServerError();

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Something went wrong',
      },
    });
  });

  it('should handle generic Error with 500 status', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Something went wrong',
      },
    });
  });

  it('should handle AppError with custom status code', () => {
    const error = new AppError('Custom error', 418);

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(418);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Custom error',
      },
    });
  });

  it('should handle errors without message', () => {
    const error = new Error();

    errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalled();
  });
});
