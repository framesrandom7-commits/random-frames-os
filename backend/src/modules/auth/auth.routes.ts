import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();

router.post('/login', AuthController.login);
// Register can only be done by FOUNDER, so we might want to put user creation in users module, 
// but we'll add a simple register for now if it's the first user, or rely on seed script.
router.post('/register', AuthController.register);

export default router;
