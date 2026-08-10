import { Router } from 'express';
import { ApprovalsController } from './approvals.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireFounder, requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

// Anyone can request
router.post('/request', authenticate, requireCoFounder, ApprovalsController.request);

// Only founder can manage
router.use(authenticate, requireFounder);
router.get('/', ApprovalsController.getAll);
router.post('/:id/approve', ApprovalsController.approve);
router.post('/:id/reject', ApprovalsController.reject);

export default router;
