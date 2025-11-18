export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  SOMETHING_WENT_WRONG: 'Something went wrong',
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Invalid credentials',
  MODEL_OVERLOADED: 'Model overloaded',
  GENERATION_FAILED: 'Generation failed',
  IMAGE_REQUIRED: 'Image file is required',
} as const;

export const GENERATION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'],
  UPLOAD_DIR: 'uploads',
} as const;

export const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  ALGORITHM: 'HS256',
} as const;

export const CIRCUIT_BREAKER_CONFIG = {
  TIMEOUT: 3000,
  ERROR_THRESHOLD_PERCENTAGE: 50,
  RESET_TIMEOUT: 30000,
} as const;
