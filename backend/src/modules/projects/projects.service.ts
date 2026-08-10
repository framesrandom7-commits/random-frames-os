import { prisma } from '../../config/prisma';

export class ProjectsService {
  static async create(data: {
    title: string;
    clientId: string;
    quotationId: string;
  }) {
    // 1. Fetch quotation
    const quotation = await prisma.quotation.findUnique({
      where: { id: data.quotationId },
    });

    if (!quotation) {
      throw new Error('Quotation not found');
    }

    // 2. Validate it belongs to same client
    if (quotation.clientId !== data.clientId) {
      throw new Error('Quotation does not belong to the selected client');
    }

    // 3. Validate status === APPROVED
    if (quotation.status !== 'APPROVED') {
      throw new Error('Project can only be created from an APPROVED quotation');
    }

    // 4. Create Project
    return prisma.project.create({
      data: {
        title: data.title,
        clientId: data.clientId,
        quotationId: data.quotationId,
      },
    });
  }

  static async getAll() {
    return prisma.project.findMany({
      include: {
        client: true,
        originQuotation: true,
      },
    });
  }
}
