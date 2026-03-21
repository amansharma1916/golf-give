import { Router } from 'express';
import { list, upcoming, get } from '../controllers/draws.controller';

const router = Router();

// Public read-only endpoints
router.get('/', list);
router.get('/upcoming', upcoming);
router.get('/:id', get);

export default router;
