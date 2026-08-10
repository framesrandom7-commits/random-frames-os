import { prisma } from '../../config/prisma';

export class ApprovalsService {
  static async requestApproval(data: { type: 'PROJECT' | 'INVOICE' | 'EXPENSE', referenceId: string, requestedById: string }) {
    return prisma.approval.create({
      data: {
        type: data.type,
        referenceId: data.referenceId,
        requestedById: data.requestedById,
      }
    });
  }

  static async getAll() {
    return prisma.approval.findMany({
      include: {
        requestedBy: true,
        approvedBy: true,
      }
    });
  }

  static async process(id: string, status: 'APPROVED' | 'REJECTED', approvedById: string, comment?: string) {
    return prisma.approval.update({
      where: { id },
      data: {
        status,
        approvedById,
        comment,
      }
    });
  }
}
