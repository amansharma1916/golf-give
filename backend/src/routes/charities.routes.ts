import { Router } from 'express';
import {
  list,
  featured,
  get,
  create,
  update,
  remove,
} from '../controllers/charities.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { createCharitySchema, updateCharitySchema } from '../validators/charities.validators';

const router = Router();

router.get('/', list);
router.get('/featured', featured);
router.get('/:id', get);
router.post('/', authMiddleware, adminMiddleware, validateMiddleware(createCharitySchema), create);
router.put('/:id', authMiddleware, adminMiddleware, validateMiddleware(updateCharitySchema), update);
router.delete('/:id', authMiddleware, adminMiddleware, remove);

export default router;
