import { Router } from 'express';
import { simulate, publish, configure, create } from '../controllers/draws.controller';
import { validateMiddleware } from '../middleware/validate.middleware';
import {
  simulateDrawSchema,
  publishDrawSchema,
  configureDrawSchema,
  createDrawSchema,
} from '../validators/draws.validators';

const router = Router();

router.post('/', validateMiddleware(createDrawSchema), create);
router.post('/simulate', validateMiddleware(simulateDrawSchema), simulate);
router.post('/:id/publish', validateMiddleware(publishDrawSchema), publish);
router.put('/:id/configure', validateMiddleware(configureDrawSchema), configure);

export default router;
