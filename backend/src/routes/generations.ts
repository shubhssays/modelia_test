import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { generationController } from '../controllers/generationController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { generationSchema } from '../utils/validation';

const router = Router();

router.post(
  '/',
  authenticate,
  upload.single('image'),
  validateRequest(generationSchema),
  asyncHandler(generationController.createGeneration)
);
router.get('/', authenticate, asyncHandler(generationController.getGenerations));

export default router;

