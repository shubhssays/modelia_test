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
import { HTTP_STATUS } from '../../utils/constants';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with message and status code', () => {
      const error = new AppError('Test error', 500);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });

    it('should set isOperational to false when specified', () => {
      const error = new AppError('Test error', 500, false);

      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test error', 500);

      expect(error.stack).toBeDefined();
    });
  });

  describe('ClientError', () => {
    it('should create ClientError with default 400 status', () => {
      const error = new ClientError('Bad request');

      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });

    it('should create ClientError with custom status code', () => {
      const error = new ClientError('Conflict', 409);

      expect(error.statusCode).toBe(409);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with errors array', () => {
      const errors = [
        { path: ['email'], message: 'Invalid email' },
        { path: ['password'], message: 'Too short' },
      ];
      const error = new ValidationError(errors);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(HTTP_STATUS.UNPROCESSABLE_ENTITY);
      expect(error.errors).toEqual(errors);
    });

    it('should create ValidationError with empty errors array', () => {
      const error = new ValidationError();

      expect(error.errors).toEqual([]);
      expect(error.statusCode).toBe(422);
    });
  });

  describe('ServerError', () => {
    it('should create ServerError with default message', () => {
      const error = new ServerError();

      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create UnauthorizedError with default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED);
    });

    it('should create UnauthorizedError with custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with message', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND);
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError with message', () => {
      const error = new ConflictError('User already exists');

      expect(error.message).toBe('User already exists');
      expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT);
    });
  });

  describe('ForbiddenError', () => {
    it('should create ForbiddenError with message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(HTTP_STATUS.FORBIDDEN);
    });
  });

  describe('Error inheritance', () => {
    it('should have correct prototype chain', () => {
      const validationError = new ValidationError();
      const clientError = new ClientError('test');
      const serverError = new ServerError();

      expect(validationError).toBeInstanceOf(AppError);
      expect(validationError).toBeInstanceOf(Error);
      expect(clientError).toBeInstanceOf(AppError);
      expect(serverError).toBeInstanceOf(AppError);
    });
  });
});
