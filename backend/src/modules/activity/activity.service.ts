import { prisma } from '../../config/prisma';

export class ActivityService {
  static async log(userId: string, action: string, entity: string) {
    return prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
      },
    });
  }

  static async getAll() {
    return prisma.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
