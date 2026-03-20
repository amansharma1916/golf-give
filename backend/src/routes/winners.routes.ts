import { Router } from 'express';
import { me, proof, all, verify, paid } from '../controllers/winners.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { subscriptionMiddleware } from '../middleware/subscription.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { uploadProofSchema, verifyProofSchema } from '../validators/winners.validators';

const router = Router();

router.get('/me', authMiddleware, subscriptionMiddleware, me);
router.post('/:id/upload-proof', authMiddleware, subscriptionMiddleware, validateMiddleware(uploadProofSchema), proof);
router.get('/', authMiddleware, adminMiddleware, all);
router.post('/:id/verify', authMiddleware, adminMiddleware, validateMiddleware(verifyProofSchema), verify);
router.post('/:id/mark-paid', authMiddleware, adminMiddleware, paid);

export default router;
