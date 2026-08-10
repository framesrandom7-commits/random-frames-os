import { Router } from 'express';
import { QuotationsController } from './quotations.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', QuotationsController.create);
router.get('/', QuotationsController.getAll);
router.patch('/:id', QuotationsController.update);

export default router;
