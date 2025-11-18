# Modelia AI Studio

A full-stack web application for AI-powered fashion image generation with user authentication, image upload, and generation history.

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Axios
- React Testing Library

### Backend
- Node.js + TypeScript
- Express
- JWT Authentication
- bcrypt
- Multer (file uploads)
- Zod (validation)
- SQLite3
- Jest + Supertest

### Testing
- Jest (Backend)
- React Testing Library (Frontend)
- Playwright (E2E)
- GitHub Actions (CI/CD)

## Project Structure

```
.
├── backend/          # Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── tests/
└── tests/           # E2E tests
```

## Setup Instructions

### Prerequisites
- Node.js >= 18
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd modelia_test
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Environment Variables

Create `.env` file in `backend/`:
```
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

Create `.env` file in `frontend/`:
```
VITE_API_URL=http://localhost:3001
```

## Running the Application

### Development Mode

1. Start the backend:
```bash
cd backend
npm run dev
```

2. Start the frontend (in another terminal):
```bash
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

### Production Build

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

## Features

- ✅ User authentication (signup/login) with JWT
- ✅ Secure password hashing with bcrypt
- ✅ Image upload with preview (max 10MB)
- ✅ AI generation simulation with configurable styles
- ✅ Error handling with retry mechanism (up to 3 attempts)
- ✅ Abort in-flight requests
- ✅ Generation history (last 5 items)
- ✅ Responsive design with TailwindCSS
- ✅ Accessibility features (ARIA, keyboard navigation)
- ✅ Dark mode support
- ✅ Comprehensive test coverage
- ✅ CI/CD with GitHub Actions

## API Documentation

See `OPENAPI.yaml` for complete API specification.

## TODOs / Future Improvements

- [ ] Add Redis for session management
- [ ] Implement pagination for generation history
- [ ] Add WebSocket for real-time generation updates
- [ ] Integrate actual AI model API
- [ ] Add image optimization/compression
- [ ] Implement CDN for static assets
- [ ] Add rate limiting
- [ ] User profile management
- [ ] Social sharing features

## License

MIT
