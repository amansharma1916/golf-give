import { Router } from 'express';
import { getScores, create, update, remove } from '../controllers/scores.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { subscriptionMiddleware } from '../middleware/subscription.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { addScoreSchema, updateScoreSchema } from '../validators/scores.validators';

const router = Router();

router.get('/', authMiddleware, subscriptionMiddleware, getScores);
router.post('/', authMiddleware, subscriptionMiddleware, validateMiddleware(addScoreSchema), create);
router.put('/:id', authMiddleware, subscriptionMiddleware, validateMiddleware(updateScoreSchema), update);
router.delete('/:id', authMiddleware, subscriptionMiddleware, remove);

export default router;
