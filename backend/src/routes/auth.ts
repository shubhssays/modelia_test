import { Router } from 'express';
import { authController } from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRequest } from '../middleware/validateRequest';
import { signupSchema, loginSchema } from '../utils/validation';

const router = Router();

router.post('/signup', validateRequest(signupSchema), asyncHandler(authController.signup));
router.post('/login', validateRequest(loginSchema), asyncHandler(authController.login));

export default router;

