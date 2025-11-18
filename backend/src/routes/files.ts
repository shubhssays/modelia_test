import { Router } from 'express';
import { fileController } from '../controllers/fileController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Secure file access - requires authentication
router.get('/:userId/:filename', authenticate, fileController.getFile);

export default router;
