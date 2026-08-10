import { prisma } from '../../config/prisma';

export class InvoicesService {
  static async create(data: { amount: number; projectId: string }) {
    return prisma.invoice.create({ data });
  }

  static async getAll() {
    return prisma.invoice.findMany({ include: { project: true, payments: true } });
  }

  static async update(id: string, data: any) {
    return prisma.invoice.update({
      where: { id },
      data,
    });
  }
}
