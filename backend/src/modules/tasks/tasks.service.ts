import { prisma } from '../../config/prisma';

export class TasksService {
  static async create(data: { title: string; projectId: string; assignedToId?: string }) {
    return prisma.task.create({ data });
  }

  static async getAll() {
    return prisma.task.findMany({ include: { project: true, assignedTo: true } });
  }

  static async update(id: string, data: any) {
    return prisma.task.update({
      where: { id },
      data,
    });
  }
}
