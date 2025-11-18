# Modelia Frontend

A modern React + TypeScript frontend application for AI-powered image generation with style transfer.

## Overview

Modelia is an image generation platform that allows users to upload images, apply various artistic styles, and generate AI-enhanced versions. The frontend is built with React, TypeScript, and Vite, featuring a clean UI with Tailwind CSS.

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State Management:** React Context API
- **Testing:** Vitest + React Testing Library
- **HTTP Client:** Axios

## Features

- 🖼️ **Image Upload** - Upload and preview images with validation (type & size)
- 🎨 **Style Selection** - Choose from multiple artistic styles (casual, formal, vintage, modern, elegant)
- ✨ **AI Generation** - Generate styled images using AI models
- 📜 **Generation History** - View and restore previous generations
- 🔐 **Authentication** - User login and signup with JWT tokens
- ♿ **Accessibility** - WCAG compliant with keyboard navigation and screen reader support
- 📱 **Responsive Design** - Mobile-first design approach

## Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ImageUpload.tsx
│   │   ├── Studio.tsx
│   │   ├── GenerationHistory.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── __tests__/    # Component tests
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useGenerate.ts
│   ├── services/         # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── generationService.ts
│   ├── utils/            # Utility functions
│   │   └── imageHelper.ts
│   ├── test/             # Test setup
│   │   └── setup.ts
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `/backend` directory)

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

The project uses Vitest and React Testing Library for comprehensive testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **5 test files** with **99 tests** (all passing ✅)
- Components tested: ImageUpload, Studio, GenerationHistory, Login, Signup
- Coverage areas: Rendering, user interactions, state management, error handling, accessibility

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Component Overview

### ImageUpload
Handles image file uploads with:
- File type validation (JPEG, PNG, WebP)
- Size validation (max 10MB)
- Preview functionality
- Drag-and-drop support
- Keyboard accessibility

### Studio
Main workspace for image generation with:
- Prompt textarea for generation instructions
- Style selector dropdown
- Integration with generation service
- Loading states and error handling

### GenerationHistory
Displays past generations with:
- Thumbnail previews
- Status badges (completed/failed/pending)
- Click to restore functionality
- Keyboard navigation
- Empty state handling

### Authentication (Login/Signup)
User authentication with:
- Form validation
- Loading indicators
- Error messages
- Navigation between forms
- Password requirements (min 6 characters)

## API Integration

The frontend communicates with the backend API through:
- **authService** - Login, signup, token management
- **generationService** - Image generation, history retrieval
- **Axios interceptors** - Automatic token injection and error handling

## Styling

Tailwind CSS is used for styling with:
- Utility-first approach
- Custom color palette (indigo theme)
- Responsive breakpoints (sm, md, lg)
- Focus and hover states for accessibility

## State Management

- **AuthContext** - Global authentication state
- **Custom Hooks** - `useAuth` and `useGenerate` for encapsulated logic
- **Local State** - Component-level state with React hooks

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT
