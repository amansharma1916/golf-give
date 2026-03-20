import { Router } from 'express';
import { list, upcoming, get, simulate, publish, configure } from '../controllers/draws.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import {
  simulateDrawSchema,
  publishDrawSchema,
  configureDrawSchema,
} from '../validators/draws.validators';

const router = Router();

router.get('/', list);
router.get('/upcoming', upcoming);
router.get('/:id', get);
router.post('/simulate', authMiddleware, adminMiddleware, validateMiddleware(simulateDrawSchema), simulate);
router.post('/:id/publish', authMiddleware, adminMiddleware, validateMiddleware(publishDrawSchema), publish);
router.put('/:id/configure', authMiddleware, adminMiddleware, validateMiddleware(configureDrawSchema), configure);

export default router;
