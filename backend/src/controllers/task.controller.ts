import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
});

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createTaskSchema.parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (data.assignedToId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: data.assignedToId, projectId: data.projectId } },
      });
      if (!isMember) {
        res.status(400).json({ message: 'Assigned user must be a member of the project' });
        return;
      }
    }

    const task = await prisma.task.create({
      data: {
        ...data,
        createdById: req.user!.id,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, status, priority, isOverdue } = req.query;

    const where: any = {};

    if (projectId) where.projectId = String(projectId);
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);

    if (isOverdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' };
    }

    if (req.user!.role !== 'ADMIN') {
      // If member, only see tasks where they are assigned, or they belong to a project where they are a member
      const memberProjects = await prisma.projectMember.findMany({
        where: { userId: req.user!.id },
        select: { projectId: true },
      });
      const projectIds = memberProjects.map((mp) => mp.projectId);

      where.OR = [
        { assignedToId: req.user!.id },
        { projectId: { in: projectIds } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN') {
      const isProjectMember = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: req.user!.id, projectId: task.projectId } },
      });
      if (!isProjectMember) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).optional(),
  dueDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  assignedToId: z.string().uuid().nullable().optional(),
});

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateTaskSchema.parse(req.body);

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    // Role-based restrictions
    if (req.user!.role !== 'ADMIN') {
      const isAssigned = existingTask.assignedToId === req.user!.id;
      if (!isAssigned) {
         res.status(403).json({ message: 'Members can only update their assigned tasks' });
         return;
      }
      
      // Member can only update status
      const allowedData = { status: data.status };
      const task = await prisma.task.update({
        where: { id },
        data: allowedData,
        include: { assignedTo: { select: { id: true, name: true } } }
      });
      res.status(200).json(task);
      return;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: { assignedTo: { select: { id: true, name: true } } }
    });

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
