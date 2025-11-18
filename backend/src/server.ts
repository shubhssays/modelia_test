import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import generationRoutes from './routes/generations';
import { sendSuccess } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Pino HTTP logger
app.use(pinoHttp({ logger }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/generations', generationRoutes);

// Health check
app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
  });
});

export default app;

