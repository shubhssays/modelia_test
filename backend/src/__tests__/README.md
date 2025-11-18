# Backend Test Suite

This directory contains comprehensive test coverage for all backend APIs, Drizzle ORM repositories, and utilities using transaction-based testing.

## Test Structure

```
src/__tests__/
├── setup.ts                              # Transaction-based test setup (PostgreSQL)
├── repositories/
│   ├── userRepository.test.ts           # Direct Drizzle SQL queries for users
│   └── generationRepository.test.ts     # Direct Drizzle SQL queries for generations
├── routes/
│   ├── auth.test.ts                     # Authentication API tests
│   ├── generations.test.ts              # Generation API tests
│   └── files.test.ts                    # File access API tests
├── middleware/
│   ├── auth.test.ts                     # JWT authentication middleware
│   ├── validateRequest.test.ts          # Zod validation middleware
│   └── errorHandler.test.ts             # Error handling middleware
├── services/
│   ├── authService.test.ts              # Auth business logic
│   └── generationService.test.ts        # Generation business logic
├── errors/
│   └── AppError.test.ts                 # Error classes
└── utils/
    ├── response.test.ts                 # Response helpers
    ├── asyncHandler.test.ts             # Async wrapper utility
    ├── fileHelper.test.ts               # File URL helpers
    └── constants.test.ts                # Application constants
```

## Running Tests

### Prerequisites
Start PostgreSQL test database on port 5433:
```bash
docker-compose -f docker-compose.test.yml up -d
```

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test -- auth.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="should login successfully"
```

### Cleanup
Stop test database:
```bash
docker-compose -f docker-compose.test.yml down
```

## Transaction-Based Testing

All tests use **transaction-based isolation** to ensure clean state:

1. **beforeAll**: Acquire single PoolClient from test database
2. **beforeEach**: Execute `BEGIN` to start transaction
3. **Test runs**: All DB operations happen within transaction
4. **afterEach**: Execute `ROLLBACK` to revert all changes
5. **afterAll**: Release PoolClient back to pool

**Benefits:**
- No database pollution between tests
- Fast test execution (no cleanup queries needed)
- True isolation - tests can run in parallel
- Consistent starting state for every test

## Test Coverage

Current coverage thresholds:
- ✅ **Branches**: 62%
- ✅ **Functions**: 57%
- ✅ **Lines**: 70%
- ✅ **Statements**: 70%

### Coverage Reports

After running tests with coverage, view the report:
- **Terminal**: Summary displayed in console
- **HTML**: Open `coverage/lcov-report/index.html` in browser
- **JSON**: `coverage/coverage-summary.json`

## Test Cases Covered

### Repository Tests (Direct Drizzle Queries)

#### User Repository (`userRepository.test.ts`)
- ✅ Insert single user with Drizzle
- ✅ Insert multiple users in batch
- ✅ Prevent duplicate email insertion
- ✅ Select all users
- ✅ Select user by email
- ✅ Select specific columns
- ✅ Update user name
- ✅ Update user password
- ✅ Delete user by email
- ✅ Delete non-existent user (returns 0 rows)
- ✅ Limit query results
- ✅ Count total users
- ✅ Transaction isolation verification

#### Generation Repository (`generationRepository.test.ts`)
- ✅ Insert generation with all fields
- ✅ Insert multiple generations
- ✅ Select all generations
- ✅ Select generation by ID
- ✅ Select generations by user ID
- ✅ Update generation status
- ✅ Update result URL
- ✅ Delete generation by ID
- ✅ Cascade delete (user deletion removes generations)
- ✅ Filter generations by style
- ✅ Order by ID descending
- ✅ Limit results
- ✅ Count generations by user
- ✅ Transaction isolation verification
- ✅ SERIAL ID auto-increment
- ✅ Timestamp auto-generation
- ✅ Foreign key constraint (userId)

### Authentication API (`auth.test.ts`)
- ✅ Successful signup with valid data
- ✅ Signup with existing user (409 Conflict)
- ✅ Signup with invalid email (422 Validation Error)
- ✅ Signup with short password (422)
- ✅ Signup with missing/empty name (422)
- ✅ Database errors during signup
- ✅ Successful login with correct credentials
- ✅ Login with non-existent user (401)
- ✅ Login with incorrect password (401)
- ✅ Login with invalid email format (422)
- ✅ Login with missing email/password (422)
- ✅ Database errors during login

### Generation API (`generations.test.ts`)
- ✅ Create generation with valid image and prompt
- ✅ Create generation without authentication (401)
- ✅ Create generation with invalid token (401)
- ✅ Create generation with missing prompt (422)
- ✅ Create generation with invalid style (422)
- ✅ Create generation without image file (400)
- ✅ Model overload error simulation (503)
- ✅ All valid style options (casual, formal, vintage, modern)
- ✅ Database errors during creation
- ✅ Get generations with default limit (5)
- ✅ Get generations with custom limit
- ✅ Get generations when none exist (empty array)
- ✅ Get generations without authentication (401)
- ✅ Invalid limit parameter handling
- ✅ Database errors during fetch

### File API (`files.test.ts`)
- ✅ Serve file for authenticated user accessing own file
- ✅ Deny access to another user's files (403)
- ✅ File not found (404)
- ✅ Access without authentication (401)
- ✅ Path traversal attack prevention
- ✅ Filenames with special characters
- ✅ Invalid file path outside uploads directory (403)

### Middleware Tests

#### Auth Middleware (`auth.test.ts`)
- ✅ Valid token authentication
- ✅ No token provided (401)
- ✅ Malformed token (401)
- ✅ Invalid token (401)
- ✅ Expired token (401)
- ✅ Token with wrong secret (401)
- ✅ Case-insensitive "Bearer" prefix

#### Validation Middleware (`validateRequest.test.ts`)
- ✅ Pass validation with valid data
- ✅ Validation error with invalid data
- ✅ Missing required fields
- ✅ Nested object validation
- ✅ Array validation
- ✅ Empty string rejection

#### Error Handler (`errorHandler.test.ts`)
- ✅ ValidationError (422)
- ✅ UnauthorizedError (401)
- ✅ NotFoundError (404)
- ✅ ConflictError (409)
- ✅ ForbiddenError (403)
- ✅ ClientError with custom status
- ✅ ServerError (500)
- ✅ Generic Error (500)
- ✅ AppError with custom status
- ✅ Errors without message

### Service Tests

#### Auth Service (`authService.test.ts`)
- ✅ Successful user signup
- ✅ Signup with existing user (ConflictError)
- ✅ JWT token generation with correct payload
- ✅ Successful login with valid credentials
- ✅ Login with non-existent user (UnauthorizedError)
- ✅ Login with incorrect password (UnauthorizedError)
- ✅ JWT token generation on login

#### Generation Service (`generationService.test.ts`)
- ✅ Create generation successfully
- ✅ Model overload error (20% chance, ClientError)
- ✅ Correct file URL generation (/v1/files/:userId/:filename)
- ✅ Delay simulation (1-2 seconds)
- ✅ File copying for result generation
- ✅ Get recent generations with default limit
- ✅ Get recent generations with custom limit
- ✅ Empty array when no generations
- ✅ Get generation by ID
- ✅ Return undefined for non-existent generation

### Utility Tests

#### Error Classes (`AppError.test.ts`)
- ✅ AppError creation with message and status
- ✅ AppError with isOperational flag
- ✅ Stack trace capture
- ✅ ClientError with default/custom status
- ✅ ValidationError with errors array
- ✅ ServerError with default/custom message
- ✅ UnauthorizedError
- ✅ NotFoundError
- ✅ ConflictError
- ✅ ForbiddenError
- ✅ Error prototype chain

#### Response Helpers (`response.test.ts`)
- ✅ Success response with default 200 status
- ✅ Success response with custom status
- ✅ Handle null/empty/array data
- ✅ Error response with default 500 status
- ✅ Error response with custom status
- ✅ Error response with errors array

#### Async Handler (`asyncHandler.test.ts`)
- ✅ Call wrapped function successfully
- ✅ Pass errors to next function
- ✅ Handle synchronous errors
- ✅ Return result of wrapped function
- ✅ Handle void functions

#### File Helpers (`fileHelper.test.ts`)
- ✅ Generate secure file URL
- ✅ Handle different user IDs
- ✅ Handle filenames with special characters
- ✅ Extract filename from path (Unix/Windows)
- ✅ Handle filenames with dots
- ✅ Generate user-specific upload directory
- ✅ Return absolute path

#### Constants (`constants.test.ts`)
- ✅ HTTP status codes
- ✅ Error messages
- ✅ Generation status values
- ✅ Circuit breaker configuration
- ✅ Immutability of constants

## Mocking Strategy

### Route Tests
- **userRepository**: Manually mocked with findByEmail, create methods
- **authService**: verifyToken mocked to return authenticated user
- **generationService**: createGeneration and getRecentGenerations mocked
- **bcrypt**: hash and compare mocked for password operations
- **multer**: Real multer with memoryStorage for proper multipart/form-data parsing

### Repository Tests
- **No mocking**: Direct Drizzle SQL queries against real PostgreSQL test database
- **Transaction isolation**: Each test runs in its own transaction (BEGIN/ROLLBACK)
- **Clean state**: Automatic rollback ensures no test pollution

### Service Tests
- **Database**: Repositories are mocked to avoid actual DB connections
- **File System**: `fs` module mocked for file operations
- **bcrypt**: Mocked for password hashing/comparison
- **jsonwebtoken**: Mocked for token generation/verification
- **Logger**: Mocked to reduce test noise

### Test Isolation
- Each test suite uses `beforeEach` to reset mocks
- `jest.clearAllMocks()` ensures clean state
- No shared state between tests

## Key Features

1. **Transaction-Based Testing**: All repository tests use BEGIN/ROLLBACK for perfect isolation
2. **Direct Drizzle Queries**: Test actual ORM queries against PostgreSQL, not mocks
3. **100% API Coverage**: Every endpoint tested with success and error cases
4. **Security Testing**: Authentication, authorization, path traversal, input validation
5. **Error Scenarios**: All error paths covered (4xx, 5xx)
6. **Edge Cases**: Empty data, null values, invalid inputs, boundary conditions
7. **File Upload Testing**: Real multer with memoryStorage for multipart/form-data
8. **JWT Testing**: Token generation, validation, expiration, invalid signatures

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- PostgreSQL test database via docker-compose
- Fast execution with transaction rollback
- Deterministic results
- Clear failure messages

## Troubleshooting

### Tests failing with "Database error"
- Ensure test database is running: `docker-compose -f docker-compose.test.yml up -d`
- Check PostgreSQL is accessible on port 5433
- Verify DB credentials in setup.ts

### Coverage not reaching thresholds
- Check `coverageThreshold` in jest.config.js
- Current targets: branches 62%, functions 57%, lines 70%, statements 70%
- Review untested branches in coverage report

### Transaction isolation issues
- Each test should only use `testDb` from setup.ts
- Never use the main `db` instance in tests
- Verify beforeEach/afterEach hooks are running

### Async timeout errors
- Increase `testTimeout` in jest.config.js
- Check for missing `await` in async tests
- Verify promises are properly resolved/rejected

## Best Practices

1. **Descriptive Test Names**: Use "should..." pattern
2. **Arrange-Act-Assert**: Clear test structure
3. **One Assertion Per Concept**: Focus tests on single behavior
4. **Transaction Isolation**: Repository tests use real DB with automatic rollback
5. **Mock External Dependencies**: Route/service tests mock I/O for speed
6. **Test Edge Cases**: Null, undefined, empty, boundary values
7. **Cleanup**: Use `beforeEach` and `afterEach` for setup/teardown
8. **Real Multer**: Use actual multer with memoryStorage for file upload tests

## Test Database Schema

Repository tests use the following PostgreSQL schema:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  style VARCHAR(50),
  image_url TEXT NOT NULL,
  result_url TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- SERIAL IDs (not UUIDs) for auto-increment
- Foreign key with CASCADE delete
- Timestamps auto-generated on insert
- Style field for generation customization
