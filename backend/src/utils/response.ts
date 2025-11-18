import { Response } from 'express';
import { HTTP_STATUS } from './constants';

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    errors?: unknown[];
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: unknown[]
): Response => {
  const response: ErrorResponse = {
    success: false,
    error: {
      message,
    },
  };

  if (errors && errors.length > 0) {
    response.error.errors = errors;
  }

  return res.status(statusCode).json(response);
};
