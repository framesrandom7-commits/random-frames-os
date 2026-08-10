import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireCoFounder } from '../../middlewares/role.middleware';

const router = Router();

router.use(authenticate, requireCoFounder);

router.post('/', ProjectsController.create);
router.get('/', ProjectsController.getAll);

export default router;
