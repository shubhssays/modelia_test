# Backend Architecture Documentation

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Circuit Breaker**: Opossum (prevents cascading failures)
- **Logging**: Pino with pino-http (structured JSON logging)
- **Validation**: Zod (schema validation)
- **Authentication**: JWT with bcrypt (password hashing)
- **File Upload**: Multer (multipart/form-data handling)

## API Versioning

All routes are versioned with `/v1/` prefix for future compatibility:
- `/v1/auth/*` - Authentication endpoints
- `/v1/generations/*` - Image generation endpoints
- `/v1/files/*` - Secure file access endpoints
- `/health` - Health check (not versioned)

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── logger.ts     # Pino logger setup
│   │   └── circuitBreaker.ts  # Opossum circuit breaker factory
│   ├── db/              # Database layer
│   │   ├── schema/      # Drizzle schema definitions
│   │   │   ├── users.ts
│   │   │   ├── generations.ts
│   │   │   └── index.ts
│   │   └── index.ts     # Database connection with connection pooling
│   ├── repositories/    # Data access layer (CRUD operations)
│   │   ├── userRepository.ts         # User CRUD with circuit breaker
│   │   ├── generationRepository.ts   # Generation CRUD with circuit breaker
│   │   └── index.ts                  # Repository exports
│   ├── services/        # Business logic layer
│   │   ├── authService.ts            # Authentication & user management
│   │   └── generationService.ts      # Image generation & file handling
│   ├── controllers/     # Request handlers (thin layer)
│   │   ├── authController.ts
│   │   ├── generationController.ts
│   │   └── fileController.ts         # Secure file access
│   ├── routes/          # Route definitions with versioning
│   │   ├── auth.ts
│   │   ├── generations.ts
│   │   └── files.ts                  # Secure file routes
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts              # JWT authentication
│   │   ├── validateRequest.ts   # Zod schema validation
│   │   ├── errorHandler.ts      # Centralized error handling
│   │   └── upload.ts            # User-specific file upload
│   ├── errors/          # Custom error classes
│   │   └── AppError.ts  # ClientError, ValidationError, ServerError, etc.
│   ├── utils/           # Utility functions
│   │   ├── asyncHandler.ts  # Async route wrapper (no try-catch)
│   │   ├── response.ts      # Consistent response formatting
│   │   ├── constants.ts     # Application constants
│   │   ├── validation.ts    # Zod validation schemas
│   │   └── fileHelper.ts    # Secure file URL generation
│   └── server.ts        # Application entry point
├── drizzle/             # Migration files (auto-generated)
├── uploads/             # User-specific file storage (not in git)
│   └── {userId}/        # Files isolated by user
├── drizzle.config.ts    # Drizzle configuration
├── tsconfig.json        # TypeScript configuration (strict mode)
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
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
- ForbiddenError (403)

// Usage in services
throw new ConflictError('User already exists');
throw new UnauthorizedError('Invalid credentials');
throw new ForbiddenError('Access denied');
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

### 5. Secure File Upload System

User-isolated file storage with permission checks:

**Directory Structure:**
```
uploads/
  ├── user_123/
  │   ├── img_1732012345-123456789.jpg
  │   └── result_1732012345-123456789.jpg
  └── user_456/
      └── img_1732012346-987654321.png
```

**Features:**
- Files stored in user-specific folders (`/uploads/{userId}/`)
- Path traversal prevention using `path.basename()`
- Authentication required for all file access
- Permission checking (users can only access their own files)
- No public static file serving
- Secure URLs: `/v1/files/{userId}/{filename}`

**Implementation:**
```typescript
// Upload middleware creates user-specific folders
const userUploadDir = path.join(uploadsBaseDir, userId.toString());

// File controller validates permissions
if (requesterId !== userId) {
  throw new ForbiddenError();
}

// Secure URL generation
const imageUrl = getSecureFileUrl(userId, filename);
// Returns: /v1/files/123/img_xxx.jpg
```

### 6. Consistent Response Format

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

### 7. Pino Logging

Structured logging with request/response tracking:

```typescript
logger.info('User created', { userId: user.id });
logger.error({ err, req }, 'Request failed');
```

## Database Setup

### 1. Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=modelia_ai
DB_SSL=false  # Set to true for production with SSL

# Logging
LOG_LEVEL=info
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

1. Request → Versioned Route (`/v1/...`)
2. Middleware (validation, authentication)
3. Controller (wrapped in asyncHandler)
4. Service (business logic, throws custom errors)
5. Repository (CRUD with circuit breaker)
6. Error Handler Middleware (catches all errors)
7. Consistent error response sent to client

## Layered Architecture

```
Request
  ↓
Routes (/v1/*)
  ↓
Middleware (auth, validation)
  ↓
Controllers (thin layer, delegates to services)
  ↓
Services (business logic)
  ↓
Repositories (data access with circuit breaker)
  ↓
Database (PostgreSQL via Drizzle ORM)
```

## Security Features

1. **Password Security**: bcrypt hashing (10 rounds)
2. **JWT Authentication**: 7-day expiration, HS256 algorithm
3. **SQL Injection Prevention**: Drizzle ORM parameterized queries
4. **Path Traversal Prevention**: `path.basename()` sanitization
5. **File Access Control**: User-based permission checking
6. **Input Validation**: Zod schema validation on all inputs
7. **Error Information Leakage**: Generic error messages in production
8. **CORS**: Configured for allowed origins
9. **Rate Limiting**: Ready for implementation (recommended)
10. **SSL Support**: Configurable for production databases

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
