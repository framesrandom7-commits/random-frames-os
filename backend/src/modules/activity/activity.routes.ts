import { Router } from 'express';
import { ActivityController } from './activity.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireFounder } from '../../middlewares/role.middleware';

const router = Router();

// Only Founder can view activities
router.use(authenticate, requireFounder);

router.get('/', ActivityController.getAll);

export default router;
