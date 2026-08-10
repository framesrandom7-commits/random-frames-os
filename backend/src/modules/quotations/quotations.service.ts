import { prisma } from '../../config/prisma';

export class QuotationsService {
  static async create(data: {
    total: number;
    clientId?: string;
    leadId?: string;
  }) {
    if (!data.clientId && !data.leadId) {
      throw new Error('Quotation must be linked to a Client or a Lead');
    }

    return prisma.quotation.create({
      data: {
        total: data.total,
        clientId: data.clientId,
        leadId: data.leadId,
        status: 'PENDING',
      },
    });
  }

  static async getAll() {
    return prisma.quotation.findMany({
      include: {
        client: true,
        lead: true,
      },
    });
  }

  static async update(id: string, data: any) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: { projects: true },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    if (quotation.status === 'APPROVED' && quotation.projects.length > 0) {
      throw new Error('Approved quotation cannot be modified');
    }

    return prisma.quotation.update({
      where: { id },
      data,
    });
  }
}
