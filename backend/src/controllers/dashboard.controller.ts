import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let projectCount = 0;
    let taskCount = 0;
    let completedTasks = 0;
    let overdueTasks = 0;
    let myTasks = 0;

    const now = new Date();

    if (role === 'ADMIN') {
      projectCount = await prisma.project.count();
      taskCount = await prisma.task.count();
      completedTasks = await prisma.task.count({ where: { status: 'COMPLETED' } });
      overdueTasks = await prisma.task.count({
        where: {
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      });
      myTasks = await prisma.task.count({ where: { assignedToId: userId } });
    } else {
      const memberProjects = await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      });
      const projectIds = memberProjects.map((mp) => mp.projectId);

      projectCount = projectIds.length;
      taskCount = await prisma.task.count({
        where: { projectId: { in: projectIds } },
      });
      completedTasks = await prisma.task.count({
        where: { projectId: { in: projectIds }, status: 'COMPLETED' },
      });
      overdueTasks = await prisma.task.count({
        where: {
          projectId: { in: projectIds },
          dueDate: { lt: now },
          status: { not: 'COMPLETED' },
        },
      });
      myTasks = await prisma.task.count({ where: { assignedToId: userId } });
    }

    const recentTasks = await prisma.task.findMany({
      where: role === 'ADMIN' ? {} : {
        OR: [
          { assignedToId: userId },
          { projectId: { in: (await prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } })).map(mp => mp.projectId) } }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    res.status(200).json({
      projectCount,
      taskCount,
      completedTasks,
      overdueTasks,
      myTasks,
      progress: taskCount === 0 ? 0 : Math.round((completedTasks / taskCount) * 100),
      recentTasks
    });
  } catch (error) {
    next(error);
  }
};
