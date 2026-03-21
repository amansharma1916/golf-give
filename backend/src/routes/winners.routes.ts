import { Router } from 'express';
import {
  me,
  proof,
  all,
  verify,
  paid,
  fileDispute,
  myDisputes,
  allDisputes,
  openDisputes,
  resolveWinnerDispute,
} from '../controllers/winners.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { subscriptionMiddleware } from '../middleware/subscription.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { uploadProofSchema, verifyProofSchema } from '../validators/winners.validators';
import { createDisputeSchema, resolveDisputeSchema } from '../validators/disputes.validators';

const router = Router();

router.get('/me', authMiddleware, subscriptionMiddleware, me);
router.post('/:id/upload-proof', authMiddleware, subscriptionMiddleware, validateMiddleware(uploadProofSchema), proof);
router.get('/', authMiddleware, adminMiddleware, all);
router.post('/:id/verify', authMiddleware, adminMiddleware, validateMiddleware(verifyProofSchema), verify);
router.post('/:id/mark-paid', authMiddleware, adminMiddleware, paid);

// Dispute routes
router.post('/disputes/file', authMiddleware, subscriptionMiddleware, validateMiddleware(createDisputeSchema), fileDispute);
router.get('/disputes/me', authMiddleware, subscriptionMiddleware, myDisputes);
router.get('/disputes', authMiddleware, adminMiddleware, allDisputes);
router.get('/disputes/open', authMiddleware, adminMiddleware, openDisputes);
router.post(
  '/disputes/:id/resolve',
  authMiddleware,
  adminMiddleware,
  validateMiddleware(resolveDisputeSchema),
  resolveWinnerDispute
);

export default router;
