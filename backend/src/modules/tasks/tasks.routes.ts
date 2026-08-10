import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', TasksController.create);
router.get('/', TasksController.getAll);
router.patch('/:id', TasksController.update);

export default router;
