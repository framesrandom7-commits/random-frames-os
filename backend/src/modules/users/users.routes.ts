import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireFounder } from '../../middlewares/role.middleware';

const router = Router();

// All user routes require FOUNDER role
router.use(authenticate, requireFounder);

router.get('/', UsersController.getAll);
router.post('/', UsersController.create);

export default router;
