import { asyncHandler } from '../../utils/asyncHandler';
import type { Request, Response, NextFunction } from 'express';

describe('Async Handler Utility', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should call the wrapped function successfully', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockFn).toHaveBeenCalledWith(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should pass errors to next function', async () => {
    const error = new Error('Test error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(error);
  });

  it('should return the result of the wrapped function', async () => {
    const expectedResult = { data: 'test' };
    const mockFn = jest.fn().mockResolvedValue(expectedResult);
    const wrappedFn = asyncHandler(mockFn);

    const result = await wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(result).toEqual(expectedResult);
  });

  it('should handle functions that return void', async () => {
    const mockFn = jest.fn().mockResolvedValue(undefined);
    const wrappedFn = asyncHandler(mockFn);

    await wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockFn).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
