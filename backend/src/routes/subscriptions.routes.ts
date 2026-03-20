import { Router } from 'express';
import {
  getStatus,
  checkout,
  cancel,
  webhookStripe,
} from '../controllers/subscriptions.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { checkoutSchema } from '../validators/subscriptions.validators';

const router = Router();

router.get('/status', authMiddleware, getStatus);
router.post('/mock-checkout', authMiddleware, validateMiddleware(checkoutSchema), checkout);
router.post('/mock-cancel', authMiddleware, cancel);
router.post('/checkout', authMiddleware, validateMiddleware(checkoutSchema), checkout);
router.post('/webhook/stripe', webhookStripe);

export default router;
