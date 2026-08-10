import { Router } from 'express';
import { InvoicesController } from './invoices.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', InvoicesController.create);
router.get('/', InvoicesController.getAll);
router.patch('/:id', InvoicesController.update);

export default router;
