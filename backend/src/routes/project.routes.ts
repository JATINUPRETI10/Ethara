import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/project.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProjects as any);
router.get('/:id', getProjectById as any);

router.post('/', createProject as any);
router.put('/:id', authorizeAdmin, updateProject as any);
router.delete('/:id', authorizeAdmin, deleteProject as any);

router.post('/:id/members', authorizeAdmin, addProjectMember as any);
router.delete('/:projectId/members/:userId', authorizeAdmin, removeProjectMember as any);

export default router;
