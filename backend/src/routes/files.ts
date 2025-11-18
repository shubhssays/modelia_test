import { Router } from 'express';
import { fileController } from '../controllers/fileController';
import { authenticateFromQuery } from '../middleware/auth';

const router = Router();

// Secure file access - requires authentication (token in query param or header)
// Usage: GET /files/:userId/:filename?token=xxx
router.get('/:userId/:filename', authenticateFromQuery, fileController.getFile);

export default router;
