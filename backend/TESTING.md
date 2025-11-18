# Backend Testing

## Test Framework
- **Jest** - Test runner with code coverage
- **Supertest** - HTTP API testing
- **PostgreSQL (Docker)** - Test database isolation

## Test Structure

```
backend/src/__tests__/
├── services/          # Business logic tests
│   ├── authService.test.ts
│   └── generationService.test.ts
├── routes/            # API endpoint tests
│   ├── auth.test.ts
│   ├── files.test.ts
│   └── generations.test.ts
├── repositories/      # Database layer tests
│   ├── userRepository.test.ts
│   └── generationRepository.test.ts
├── middleware/        # Middleware tests
│   ├── auth.test.ts
│   ├── errorHandler.test.ts
│   └── validateRequest.test.ts
├── utils/             # Utility function tests
│   ├── asyncHandler.test.ts
│   ├── constants.test.ts
│   ├── fileHelper.test.ts
│   └── response.test.ts
└── errors/            # Error class tests
    └── AppError.test.ts
```

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with Docker test database
npm run test:full

# Start test database
npm run test:db:up

# Stop test database
npm run test:db:down
```

## Test Coverage

### Services (Business Logic)
- ✅ **authService** - User registration, login, JWT generation
- ✅ **generationService** - Image generation, history retrieval, AI model simulation

### API Routes
- ✅ **auth** - Signup/login endpoints with validation
- ✅ **files** - File serving with access control
- ✅ **generations** - Creation and retrieval of generations

### Repositories (Data Layer)
- ✅ **userRepository** - User CRUD operations
- ✅ **generationRepository** - Generation CRUD operations

### Middleware
- ✅ **auth** - JWT verification and user extraction
- ✅ **errorHandler** - Error response formatting
- ✅ **validateRequest** - Request validation with Joi

### Utilities
- ✅ **asyncHandler** - Express async error handling
- ✅ **constants** - Configuration validation
- ✅ **fileHelper** - File operations and path validation
- ✅ **response** - Standardized API responses

### Error Handling
- ✅ **AppError** - Custom error classes (ClientError, ConflictError, UnauthorizedError, etc.)

## Key Test Patterns

### Mocking
- Database queries mocked with Jest
- File system operations mocked
- External services (AI models) simulated

### Authentication
- JWT tokens generated for protected routes
- User context injected into requests
- Access control validated

### Database
- Test database runs in Docker container
- Isolated test environment
- Clean state between tests

### API Testing
- HTTP status codes verified
- Response body structure validated
- Error messages checked
- Request validation tested

## Notes

All tests follow Jest best practices with proper setup/teardown, isolated test cases, and comprehensive assertions for both success and error scenarios.
