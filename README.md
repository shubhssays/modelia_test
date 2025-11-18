# Modelia AI Studio

A full-stack web application for AI-powered image generation with style transfer. Upload images, apply artistic styles, and generate AI-enhanced versions with a modern, accessible interface.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Component Architecture](#component-architecture)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Modelia is an image generation platform that combines modern web technologies with AI capabilities to provide users with an intuitive interface for creating styled images. Built with React and TypeScript on the frontend and Node.js with Express on the backend, the application demonstrates best practices in full-stack development, including comprehensive testing, proper authentication, and accessibility standards.

---

## ✨ Features

### Core Functionality
- 🖼️ **Image Upload** - Drag-and-drop or click to upload with validation (JPEG, PNG, WebP, max 10MB)
- 🎨 **Style Selection** - Choose from 5 artistic styles (casual, formal, vintage, modern, elegant)
- ✨ **AI Generation** - Generate styled images with simulated AI processing (1-2s delay)
- 📜 **Generation History** - View and restore previous 5 generations with status tracking
- 🔐 **User Authentication** - Secure JWT-based signup/login with bcrypt password hashing

### User Experience
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- ♿ **Accessibility** - WCAG compliant with ARIA labels, keyboard navigation, screen reader support
- 🌙 **Dark Mode Support** - Seamless theme switching
- ⚡ **Real-time Feedback** - Loading states, error messages, and success indicators
- 🔄 **Request Management** - Abort in-flight requests, retry mechanism (up to 3 attempts)

### Quality Assurance
- ✅ **Comprehensive Testing** - 99 frontend tests, full backend coverage
- 🔒 **Security** - JWT tokens, secure password storage, file validation
- 📊 **Error Handling** - Graceful error recovery with user-friendly messages
- 🚀 **CI/CD Ready** - GitHub Actions integration

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks and context |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **Vitest** | Unit testing framework |
| **React Testing Library** | Component testing utilities |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + TypeScript** | Runtime environment |
| **Express** | Web framework |
| **PostgreSQL** | Relational database |
| **Drizzle ORM** | Type-safe database toolkit |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Joi** | Request validation |
| **Jest + Supertest** | Testing framework |

### DevOps & Tools
- **Docker** - Containerized test database
- **ESLint + Prettier** - Code quality and formatting
- **GitHub Actions** - CI/CD pipeline
- **Playwright** - End-to-end testing

---

## 📁 Project Structure

```
modelia_test/
│
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── routes/            # API endpoint definitions
│   │   │   ├── auth.ts        # Authentication routes
│   │   │   ├── files.ts       # File serving routes
│   │   │   └── generations.ts # Generation routes
│   │   ├── services/          # Business logic layer
│   │   │   ├── authService.ts
│   │   │   └── generationService.ts
│   │   ├── repositories/      # Data access layer
│   │   │   ├── userRepository.ts
│   │   │   └── generationRepository.ts
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.ts        # JWT verification
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── utils/             # Helper functions
│   │   │   ├── asyncHandler.ts
│   │   │   ├── fileHelper.ts
│   │   │   ├── response.ts
│   │   │   └── constants.ts
│   │   ├── errors/            # Custom error classes
│   │   │   └── AppError.ts
│   │   ├── __tests__/         # Test files (15 files)
│   │   ├── db.ts              # Database connection
│   │   └── server.ts          # Application entry point
│   ├── drizzle/               # Database migrations
│   ├── uploads/               # User uploaded files
│   ├── TESTING.md             # Backend test documentation
│   ├── ARCHITECTURE.md        # Architecture documentation
│   ├── docker-compose.test.yml
│   ├── jest.config.js
│   └── package.json
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── Studio.tsx
│   │   │   ├── GenerationHistory.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── __tests__/    # Component tests (5 files, 99 tests)
│   │   ├── context/           # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts    # Authentication hook
│   │   │   └── useGenerate.ts # Generation hook
│   │   ├── services/          # API integration
│   │   │   ├── api.ts        # Axios instance
│   │   │   ├── authService.ts
│   │   │   └── generationService.ts
│   │   ├── utils/             # Utility functions
│   │   │   └── imageHelper.ts
│   │   ├── types/             # TypeScript definitions
│   │   ├── test/              # Test setup
│   │   │   └── setup.ts
│   │   ├── assets/            # Static assets
│   │   ├── App.tsx            # Root component
│   │   ├── main.tsx           # Application entry
│   │   └── index.css          # Global styles
│   ├── public/                # Static public files
│   ├── TESTING.md             # Frontend test documentation
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── package.json
│
└── tests/                      # E2E tests (Playwright)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0 (for production)
- **Docker** (optional, for test database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shubhssays/modelia_test.git
   cd modelia_test
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Configuration

#### Backend Environment (`.env` in `/backend`)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=modelia
DB_PASSWORD=modelia_password
DB_NAME=modelia_dev

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

#### Frontend Environment (`.env` in `/frontend`)
```env
VITE_API_URL=http://localhost:3001/api
```

### Database Setup

1. **Create PostgreSQL database**
   ```bash
   createdb modelia_dev
   ```

2. **Run migrations**
   ```bash
   cd backend
   npm run db:push
   ```

---

## 💻 Development

### Running the Application

#### Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on: **http://localhost:3001**

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Application runs on: **http://localhost:5173**

### Development Scripts

#### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run db:generate  # Generate database migrations
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio
```

#### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run Vitest tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report
```

---

## 🧪 Testing

### Backend Testing

#### Setup Test Database
```bash
cd backend
npm run test:db:up   # Start PostgreSQL in Docker (port 5433)
```

#### Run Tests
```bash
npm test             # Run all tests with coverage
npm run test:watch   # Watch mode for development
npm run test:full    # Full suite: start DB → test → stop DB
```

#### Test Coverage
- **15 test files** covering all layers
- **Test Categories:**
  - Routes: auth, files, generations
  - Services: authService, generationService
  - Repositories: userRepository, generationRepository
  - Middleware: auth, errorHandler, validateRequest
  - Utils: asyncHandler, constants, fileHelper, response
  - Errors: AppError classes

**Coverage Thresholds:**
- Branches: 62%
- Functions: 57%
- Lines: 70%
- Statements: 70%

See [backend/TESTING.md](./backend/TESTING.md) for detailed documentation.

#### Cleanup
```bash
npm run test:db:down # Stop and remove test database
```

### Frontend Testing

#### Run Tests
```bash
cd frontend
npm test              # Run all 99 tests
npm run test:ui       # Interactive UI mode
npm run test:coverage # Coverage report
```

#### Test Coverage
- **5 test files, 99 tests** (all passing ✅)
- **Components tested:**
  - `ImageUpload` (9 tests) - File validation, upload, keyboard navigation
  - `Studio` (16 tests) - Prompt input, style selection, integration
  - `GenerationHistory` (23 tests) - List display, interactions, accessibility
  - `Login` (22 tests) - Form validation, authentication, error handling
  - `Signup` (29 tests) - Registration, validation, navigation

**Coverage Areas:**
- ✅ Component rendering
- ✅ User interactions (click, type, keyboard)
- ✅ Form validation and submission
- ✅ Loading and error states
- ✅ Accessibility (ARIA, screen readers)
- ✅ Edge cases and error scenarios

See [frontend/TESTING.md](./frontend/TESTING.md) for detailed documentation.

### End-to-End Testing
```bash
npm run test:e2e     # Run Playwright tests
```

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

#### POST `/api/auth/login`
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Generation Endpoints

#### POST `/api/generations`
Create a new generation (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**
```
prompt: "A professional photo"
style: "modern"
image: <file>
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "prompt": "A professional photo",
    "style": "modern",
    "status": "completed",
    "originalImageUrl": "/api/files/...",
    "resultImageUrl": "/api/files/...",
    "createdAt": "2025-11-19T..."
  }
}
```

#### GET `/api/generations`
Retrieve user's generation history (requires authentication).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "prompt": "A professional photo",
      "style": "modern",
      "status": "completed",
      "originalImageUrl": "/api/files/...",
      "resultImageUrl": "/api/files/...",
      "createdAt": "2025-11-19T..."
    }
  ]
}
```

### File Endpoints

#### GET `/api/files/:userId/:filename`
Serve uploaded or generated files (requires authentication).

**Response:** `200 OK`
- Content-Type: `image/jpeg`, `image/png`, or `image/webp`
- Binary image data

---

## 🏗 Component Architecture

### Frontend Architecture

#### Component Hierarchy
```
App (Router)
├── AuthContext Provider
│   ├── Login Component
│   ├── Signup Component
│   └── Studio Component
│       ├── ImageUpload
│       ├── Prompt Textarea
│       ├── Style Selector
│       └── GenerationHistory
```

#### State Management
- **Global State:** `AuthContext` for user authentication
- **Custom Hooks:** `useAuth`, `useGenerate` for encapsulated logic
- **Local State:** React `useState` for component-level state

#### API Integration
```
Component → Hook → Service → Axios → Backend API
```

### Backend Architecture

#### Layered Architecture
```
Route Handler → Service Layer → Repository Layer → Database
      ↓              ↓                ↓
  Validation    Business Logic   Data Access
```

#### Request Flow
1. **Route** receives HTTP request
2. **Middleware** validates and authenticates
3. **Service** processes business logic
4. **Repository** handles database operations
5. **Response** sends formatted JSON

---

## 🚢 Deployment

### Production Build

#### Backend
```bash
cd backend
npm run build        # Compile TypeScript
npm start            # Run production server
```

#### Frontend
```bash
cd frontend
npm run build        # Create optimized build
npm run preview      # Test production build locally
```

### Environment Variables (Production)

Update `.env` files with production values:
- Use strong `JWT_SECRET`
- Set `NODE_ENV=production`
- Configure production database credentials
- Update `VITE_API_URL` to production API endpoint

### Deployment Platforms

**Recommended:**
- **Backend:** Railway, Render, Heroku, AWS EC2
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** Railway PostgreSQL, Supabase, AWS RDS

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Run tests**
   ```bash
   npm test  # In both backend and frontend
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style

- **TypeScript** strict mode enabled
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for commit messages

### Testing Requirements

- All new features must include tests
- Maintain or improve existing coverage
- All tests must pass before merging

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Support

For issues, questions, or contributions:
- **GitHub Issues:** [Report a bug or request a feature](https://github.com/shubhssays/modelia_test/issues)
- **Documentation:** See `TESTING.md` and `ARCHITECTURE.md` files

---

**Built with ❤️ by the Modelia Team**
