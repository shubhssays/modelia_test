import {
  HTTP_STATUS,
  ERROR_MESSAGES,
  GENERATION_STATUS,
  CIRCUIT_BREAKER_CONFIG,
} from '../../utils/constants';

describe('Constants', () => {
  describe('HTTP_STATUS', () => {
    it('should have correct HTTP status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.CONFLICT).toBe(409);
      expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBe('Unauthorized access');
      expect(ERROR_MESSAGES.VALIDATION_FAILED).toBe('Validation failed');
      expect(ERROR_MESSAGES.SOMETHING_WENT_WRONG).toBe('Something went wrong');
      expect(ERROR_MESSAGES.USER_EXISTS).toBe('User already exists');
      expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toBe('Invalid credentials');
      expect(ERROR_MESSAGES.MODEL_OVERLOADED).toBe('Model overloaded');
      expect(ERROR_MESSAGES.IMAGE_REQUIRED).toBe('Image file is required');
    });
  });

  describe('GENERATION_STATUS', () => {
    it('should have all generation status values', () => {
      expect(GENERATION_STATUS.PENDING).toBe('pending');
      expect(GENERATION_STATUS.COMPLETED).toBe('completed');
      expect(GENERATION_STATUS.FAILED).toBe('failed');
    });
  });

  describe('CIRCUIT_BREAKER_CONFIG', () => {
    it('should have correct circuit breaker configuration', () => {
      expect(CIRCUIT_BREAKER_CONFIG.TIMEOUT).toBe(3000);
      expect(CIRCUIT_BREAKER_CONFIG.ERROR_THRESHOLD_PERCENTAGE).toBe(50);
      expect(CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT).toBe(30000);
    });

    it('should have reasonable timeout values', () => {
      expect(CIRCUIT_BREAKER_CONFIG.TIMEOUT).toBeGreaterThan(0);
      expect(CIRCUIT_BREAKER_CONFIG.RESET_TIMEOUT).toBeGreaterThan(CIRCUIT_BREAKER_CONFIG.TIMEOUT);
    });

    it('should have valid error threshold percentage', () => {
      expect(CIRCUIT_BREAKER_CONFIG.ERROR_THRESHOLD_PERCENTAGE).toBeGreaterThan(0);
      expect(CIRCUIT_BREAKER_CONFIG.ERROR_THRESHOLD_PERCENTAGE).toBeLessThanOrEqual(100);
    });
  });
});
