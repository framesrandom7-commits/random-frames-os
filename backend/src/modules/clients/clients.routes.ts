import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', ClientsController.create);
router.get('/', ClientsController.getAll);

export default router;
