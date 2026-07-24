import { prisma } from "@/lib/prisma";

export class CalendarSearchService {
  /**
   * Unified search across Events, Tasks, and Reminders
   */
  static async search(query: string, options?: {
    startDate?: Date;
    endDate?: Date;
    projectId?: string;
    clientId?: string;
  }) {
    const term = `%${query}%`;
    
    // Using simple ILIKE search logic via Prisma where conditions
    const [events, tasks, reminders] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
          ...(options?.projectId && { projectId: options.projectId }),
          ...(options?.clientId && { clientId: options.clientId }),
          ...(options?.startDate && options?.endDate && {
            date: { gte: options.startDate, lte: options.endDate }
          })
        },
        include: { project: true, client: true }
      }),
      
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          ...(options?.projectId && { projectId: options.projectId }),
          ...(options?.clientId && { clientId: options.clientId }),
          ...(options?.startDate && options?.endDate && {
            dueDate: { gte: options.startDate, lte: options.endDate }
          })
        },
        include: { project: true, client: true }
      }),
      
      prisma.reminder.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          ...(options?.projectId && { projectId: options.projectId }),
          ...(options?.startDate && options?.endDate && {
            triggerDate: { gte: options.startDate, lte: options.endDate }
          })
        },
        include: { project: true }
      })
    ]);

    return { events, tasks, reminders };
  }
}
