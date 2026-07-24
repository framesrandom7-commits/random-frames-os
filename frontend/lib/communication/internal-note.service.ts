import { prisma } from "@/lib/prisma";

export class InternalNoteService {
  /**
   * Create an internal note securely linked to an entity
   */
  public static async createNote(data: {
    content: string;
    isPinned?: boolean;
    leadId?: string;
    clientId?: string;
    projectId?: string;
    invoiceId?: string;
    quotationId?: string;
    paymentId?: string;
    eventId?: string;
    createdBy?: string;
  }) {
    return prisma.internalNote.create({
      data: {
        content: data.content,
        isPinned: data.isPinned || false,
        leadId: data.leadId,
        clientId: data.clientId,
        projectId: data.projectId,
        invoiceId: data.invoiceId,
        quotationId: data.quotationId,
        paymentId: data.paymentId,
        eventId: data.eventId,
        createdById: data.createdBy
      }
    });
  }

  public static async getNotesForEntity(where: {
    clientId?: string;
    leadId?: string;
    projectId?: string;
    invoiceId?: string;
  }) {
    return prisma.internalNote.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });
  }
}
