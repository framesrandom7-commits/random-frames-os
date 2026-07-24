import { prisma } from "@/lib/prisma";

export class CommunicationSearchService {
  /**
   * Search communications, follow-ups, deliveries, and notes
   */
  public static async search(query: string, filter?: {
    type?: string;
    clientId?: string;
    projectId?: string;
  }) {
    // This is a simplified search for V1.
    // In a real production system, this would use full-text search indexes or Elasticsearch.
    const communicationMatches = await prisma.communication.findMany({
      where: {
        AND: [
          filter?.clientId ? { clientId: filter.clientId } : {},
          filter?.projectId ? { projectId: filter.projectId } : {},
          {
            OR: [
              { subject: { contains: query, mode: 'insensitive' } },
              { body: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      take: 20
    });

    const noteMatches = await prisma.internalNote.findMany({
      where: {
        AND: [
          filter?.clientId ? { clientId: filter.clientId } : {},
          filter?.projectId ? { projectId: filter.projectId } : {},
          { content: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 20
    });

    return {
      communications: communicationMatches,
      notes: noteMatches
    };
  }
}
