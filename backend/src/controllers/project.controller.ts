import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user!.id,
        members: {
          create: {
            userId: req.user!.id,
          },
        },
      },
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const role = req.user!.role;

    if (role === 'ADMIN') {
      const projects = await prisma.project.findMany({
        include: { _count: { select: { tasks: true, members: true } } },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(projects);
      return;
    }

    // Members only see their assigned projects
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user!.id },
      include: {
        project: {
          include: { _count: { select: { tasks: true, members: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const projects = memberships.map((m) => m.project);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        tasks: {
          include: { assignedTo: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN') {
      const isMember = project.members.some((m) => m.userId === req.user!.id);
      if (!isMember) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
    }

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export const updateProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const memberSchema = z.object({
  userId: z.string().uuid(),
});

export const addProjectMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { userId } = memberSchema.parse(req.body);

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    const membership = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json(membership);
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId, userId } = req.params;

    await prisma.projectMember.deleteMany({
      where: {
        projectId,
        userId,
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
