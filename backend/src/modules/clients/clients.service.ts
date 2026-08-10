import { prisma } from '../../config/prisma';

export class ClientsService {
  static async create(data: {
    name: string;
    email: string;
    quotedAmount: number;
    approved: boolean;
    approvalMethod: 'WHATSAPP' | 'CALL' | 'EMAIL' | 'IN_PERSON' | 'OTHER';
  }) {
    if (!data.approved) {
      throw new Error('Direct client creation requires approved = true');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create the client
      const client = await tx.client.create({
        data: {
          name: data.name,
          email: data.email,
          quotedAmount: data.quotedAmount,
          approved: data.approved,
          approvalMethod: data.approvalMethod,
          approvedAt: new Date(),
        },
      });

      // 2. Auto-create quotation for record and mark as APPROVED
      await tx.quotation.create({
        data: {
          clientId: client.id,
          total: data.quotedAmount,
          status: 'APPROVED',
        },
      });

      return client;
    });
  }

  static async getAll() {
    return prisma.client.findMany({
      include: {
        quotations: true,
        projects: true,
      },
    });
  }
}
