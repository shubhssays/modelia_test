import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { generationController } from '../controllers/generationController';

const router = Router();

router.post('/', authenticate, upload.single('image'), generationController.createGeneration);
router.get('/', authenticate, generationController.getGenerations);

export default router;
