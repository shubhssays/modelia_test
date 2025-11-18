import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ClientError extends AppError {
  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST) {
    super(message, statusCode);
  }
}

export class ValidationError extends AppError {
  public errors: unknown[];

  constructor(errors: unknown[] = [], message = ERROR_MESSAGES.VALIDATION_FAILED) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    this.errors = errors;
  }
}

export class ServerError extends AppError {
  constructor(message = ERROR_MESSAGES.SOMETHING_WENT_WRONG) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, false);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}
