import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', PaymentsController.create);

export default router;
