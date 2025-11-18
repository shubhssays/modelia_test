import { sendSuccess, sendError } from '../../utils/response';
import type { Response } from 'express';

describe('Response Utilities', () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with 200 status by default', () => {
      const data = { id: 1, name: 'Test' };

      sendSuccess(mockResponse as Response, data);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should send success response with custom status code', () => {
      const data = { id: 1 };

      sendSuccess(mockResponse as Response, data, undefined, 201);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });

    it('should handle null data', () => {
      sendSuccess(mockResponse as Response, null);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: null,
      });
    });

    it('should handle empty object', () => {
      sendSuccess(mockResponse as Response, {});

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {},
      });
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];

      sendSuccess(mockResponse as Response, data);

      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data,
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with 500 status by default', () => {
      const message = 'Error occurred';

      sendError(mockResponse as Response, message);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: { message },
      });
    });

    it('should send error response with custom status code', () => {
      const message = 'Not found';

      sendError(mockResponse as Response, message, 404);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: { message },
      });
    });

    it('should include errors array when provided', () => {
      const message = 'Validation failed';
      const errors = [
        { field: 'email', message: 'Invalid' },
        { field: 'password', message: 'Too short' },
      ];

      sendError(mockResponse as Response, message, 422, errors);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message,
          errors,
        },
      });
    });

    it('should handle error without additional errors', () => {
      sendError(mockResponse as Response, 'Server error', 500);

      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Server error' },
      });
    });
  });
});
