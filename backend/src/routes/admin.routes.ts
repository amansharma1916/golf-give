import { Router } from 'express';
import { users, update, reports } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

router.get('/users', authMiddleware, adminMiddleware, users);
router.put('/users/:id', authMiddleware, adminMiddleware, update);
router.get('/reports', authMiddleware, adminMiddleware, reports);

export default router;
