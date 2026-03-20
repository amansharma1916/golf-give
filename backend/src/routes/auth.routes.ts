import { Router } from 'express';
import { signup, register, me } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { signupSchema, registerSchema } from '../validators/auth.validators';

const router = Router();

router.post('/signup', validateMiddleware(signupSchema), signup);
router.post('/register', validateMiddleware(registerSchema), authMiddleware, register);
router.get('/me', authMiddleware, me);

export default router;
