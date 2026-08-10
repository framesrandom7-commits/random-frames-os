import { Router } from 'express';
import { LeadsController } from './leads.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', LeadsController.create);
router.get('/', LeadsController.getAll);
router.patch('/:id', LeadsController.update);
router.post('/:id/convert', LeadsController.convert);

export default router;
