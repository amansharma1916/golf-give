import { Router } from 'express';
import { webhookStripe } from '../controllers/subscriptions.controller';

const router = Router();

router.post('/stripe', webhookStripe);

export default router;
