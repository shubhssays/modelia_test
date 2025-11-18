| Feature/Test | Implemented | File/Path |
|---------------|-------------|-----------|
| JWT Auth (signup/login) | ✅ | backend/src/routes/auth.ts |
| Image upload preview | ✅ | frontend/src/components/ImageUpload.tsx |
| Abort in-flight request | ✅ | frontend/src/hooks/useGenerate.ts |
| Exponential retry logic | ✅ | frontend/src/hooks/useRetry.ts |
| 20% simulated overload | ✅ | backend/src/controllers/generationController.ts |
| GET last 5 generations | ✅ | backend/src/controllers/generationController.ts |
| Unit tests backend | ✅ | backend/tests/auth.test.ts |
| Unit tests frontend | ✅ | frontend/tests/Generate.test.tsx |
| E2E flow | ✅ | tests/e2e.spec.ts |
| ESLint + Prettier configured | ✅ | .eslintrc.js, .prettierrc |
| CI + Coverage report | ✅ | .github/workflows/ci.yml |
| Password hashing (bcrypt) | ✅ | backend/src/services/authService.ts |
| Token validation middleware | ✅ | backend/src/middleware/auth.ts |
| Input validation (Zod) | ✅ | backend/src/utils/validation.ts |
| SQLite database setup | ✅ | backend/src/models/database.ts |
| File upload handling | ✅ | backend/src/middleware/upload.ts |
| Responsive UI (Tailwind) | ✅ | frontend/src/components/* |
| Accessibility (ARIA) | ✅ | frontend/src/components/* |
| Dark mode support | ✅ | frontend/src/App.tsx |
| Error boundaries | ✅ | frontend/src/components/ErrorBoundary.tsx |
| Loading states | ✅ | frontend/src/components/Studio.tsx |
| OpenAPI specification | ✅ | OPENAPI.yaml |
| Docker setup | ⚠️ | docker-compose.yml (optional) |
| Image resizing | ⚠️ | TODO: Future enhancement |
