import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTasks as any);
router.get('/:id', getTaskById as any);

router.post('/', authorizeAdmin, createTask as any);
router.put('/:id', updateTask as any);
router.delete('/:id', authorizeAdmin, deleteTask as any);

export default router;
