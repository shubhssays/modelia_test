# Backend Architecture Documentation

## Technology Stack

- **Database**: PostgreSQL with Drizzle ORM
- **Circuit Breaker**: Opossum
- **Logging**: Pino with pino-http
- **Validation**: Zod
- **Authentication**: JWT with bcrypt

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── logger.ts     # Pino logger setup
│   │   └── circuitBreaker.ts  # Opossum circuit breaker factory
│   ├── db/              # Database layer
│   │   ├── schema/      # Drizzle schema definitions
│   │   └── index.ts     # Database connection with connection pooling
│   ├── repositories/    # Data access layer
│   │   ├── userRepository.ts         # User CRUD operations
│   │   └── generationRepository.ts   # Generation CRUD operations
│   ├── services/        # Business logic layer
│   │   ├── authService.ts            # Authentication logic
│   │   └── generationService.ts      # Generation logic
│   ├── controllers/     # Request handlers
│   │   ├── authController.ts
│   │   └── generationController.ts
│   ├── routes/          # Route definitions
│   │   ├── auth.ts
│   │   └── generations.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts              # JWT authentication
│   │   ├── validateRequest.ts   # Zod schema validation
│   │   ├── errorHandler.ts      # Centralized error handling
│   │   └── upload.ts            # File upload handling
│   ├── errors/          # Custom error classes
│   │   └── AppError.ts  # ClientError, ValidationError, ServerError
│   ├── utils/           # Utility functions
│   │   ├── asyncHandler.ts  # Async route wrapper
│   │   ├── response.ts      # Consistent response formatting
│   │   ├── constants.ts     # Application constants
│   │   └── validation.ts    # Zod validation schemas
│   └── server.ts        # Application entry point
├── drizzle/             # Migration files
├── drizzle.config.ts    # Drizzle configuration
└── package.json
```

## Key Features

### 1. Repository Pattern with Circuit Breaker

All database operations are wrapped in circuit breakers using Opossum:

```typescript
class UserRepository {
  private findByIdBreaker = createCircuitBreaker(
    this._findById.bind(this),
    'UserRepository.findById'
  );

  async findById(id: number): Promise<User | undefined> {
    return this.findByIdBreaker.fire(id);
  }
}
```

### 2. Centralized Error Handling

Custom error classes with consistent error responses:

```typescript
// Error classes
- AppError (base)
- ClientError (400)
- ValidationError (422)
- ServerError (500)
- UnauthorizedError (401)
- NotFoundError (404)
- ConflictError (409)

// Usage in services
throw new ConflictError('User already exists');
throw new UnauthorizedError('Invalid credentials');
```

### 3. Async Route Handler

Eliminates try-catch blocks in controllers:

```typescript
router.post('/signup', 
  validateRequest(signupSchema), 
  asyncHandler(authController.signup)
);
```

### 4. Validation Middleware

Zod schema validation before reaching controllers:

```typescript
router.post('/signup', 
  validateRequest(signupSchema),  // Validates req.body
  asyncHandler(authController.signup)
);
```

### 5. Consistent Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "errors": []  // Optional validation errors
  }
}
```

### 6. Pino Logging

Structured logging with request/response tracking:

```typescript
logger.info('User created', { userId: user.id });
logger.error({ err, req }, 'Request failed');
```

## Database Setup

### 1. Environment Variables

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=modelia_ai
```

### 2. Run Migrations

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

### 3. Schema

**Users Table:**
- id (serial, primary key)
- email (varchar, unique)
- password (text)
- name (varchar)
- created_at (timestamp)

**Generations Table:**
- id (serial, primary key)
- user_id (integer, foreign key)
- prompt (text)
- style (varchar)
- image_url (text)
- result_url (text, nullable)
- status (varchar)
- created_at (timestamp)

## Error Handling Flow

1. Request → Middleware (validation)
2. Controller (wrapped in asyncHandler)
3. Service (throws custom errors)
4. Repository (circuit breaker)
5. Error Handler Middleware (catches all errors)
6. Consistent error response sent to client

## Constants & Utilities

All magic numbers and strings are centralized in `utils/constants.ts`:

```typescript
HTTP_STATUS.OK
ERROR_MESSAGES.SOMETHING_WENT_WRONG
GENERATION_STATUS.COMPLETED
CIRCUIT_BREAKER_CONFIG.TIMEOUT
```

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## Production Considerations

1. **Database Connection Pooling**: Configured with max 20 connections
2. **Circuit Breaker**: Prevents cascading failures
3. **Graceful Shutdown**: Handles SIGTERM for clean shutdown
4. **Error Logging**: All errors logged with full context
5. **Validation**: All inputs validated before processing
6. **Security**: Passwords hashed, JWT tokens, SQL injection prevention via Drizzle ORM
