import { prisma } from "@/lib/prisma";

export class ProjectAnalyticsService {
  /**
   * Get project metrics and status distribution
   */
  public static async getProjectMetrics(startDate?: Date, endDate?: Date) {
    const baseWhere = {
      archivedAt: null,
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        }
      } : {})
    };

    const totalProjects = await prisma.project.count({ where: baseWhere });
    const completedProjects = await prisma.project.count({
      where: { ...baseWhere, status: { in: ["COMPLETED", "DELIVERED"] } }
    });

    const activeProjects = await prisma.project.count({
      where: { ...baseWhere, status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] } }
    });

    const projectsByStatus = await prisma.project.groupBy({
      by: ['status'],
      _count: true,
      where: baseWhere
    });

    const statusDistribution = projectsByStatus.map(p => ({
      name: p.status,
      value: p._count
    }));

    return {
      totalProjects,
      completedProjects,
      activeProjects,
      statusDistribution
    };
  }

  /**
   * Get Task metrics
   */
  public static async getTaskMetrics(startDate?: Date, endDate?: Date) {
    const totalTasks = await prisma.task.count({
      where: {
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        } : {})
      }
    });

    const completedTasks = await prisma.task.count({
      where: {
        status: "COMPLETED",
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        } : {})
      }
    });

    const overdueTasks = await prisma.task.count({
      where: {
        status: { not: "COMPLETED" },
        dueDate: { lt: new Date() },
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        } : {})
      }
    });

    return {
      totalTasks,
      completedTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? Number(((completedTasks / totalTasks) * 100).toFixed(1)) : 0
    };
  }
}
