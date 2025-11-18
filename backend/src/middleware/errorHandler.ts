import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
  });

  // Handle known operational errors
  if (err instanceof ValidationError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle unknown errors
  if (process.env.NODE_ENV === 'development') {
    sendError(res, err.message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } else {
    sendError(res, ERROR_MESSAGES.SOMETHING_WENT_WRONG, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};
