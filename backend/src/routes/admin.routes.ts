import { Router } from 'express';
import { users, update, reports } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { validateMiddleware } from '../middleware/validate.middleware';
import { updateAdminUserSchema } from '../validators/admin.validators';
import adminDrawsRoutes from './admin-draws.routes';

const router = Router();

// Apply auth and admin middleware to all admin routes
router.use(authMiddleware, adminMiddleware);

router.get('/users', users);
router.put(
	'/users/:id',
	validateMiddleware(updateAdminUserSchema),
	update
);
router.get('/reports', reports);

// Admin draw management
router.use('/draws', adminDrawsRoutes);

export default router;
