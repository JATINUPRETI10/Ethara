import { Router } from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/auth.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.get('/me', authenticate, getMe as any);
router.get('/users', authenticate, authorizeAdmin, getAllUsers as any);

export default router;
