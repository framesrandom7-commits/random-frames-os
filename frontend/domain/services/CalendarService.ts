import { CalendarRepository } from "../repositories/CalendarRepository";
import { Prisma } from "@prisma/client";

export class CalendarService {
  static async getEvents(params?: {
    dateStart?: string;
    dateEnd?: string;
    clientId?: string;
    projectId?: string;
    eventType?: any;
    status?: any;
  }) {
    const where: Prisma.CalendarEventWhereInput = {};

    if (params?.dateStart && params?.dateEnd) {
      where.date = {
        gte: new Date(params.dateStart),
        lte: new Date(params.dateEnd),
      };
    } else if (params?.dateStart) {
      where.date = {
        gte: new Date(params.dateStart),
      };
    }

    if (params?.clientId) where.clientId = params.clientId;
    if (params?.projectId) where.projectId = params.projectId;
    if (params?.eventType) where.eventType = params.eventType;
    if (params?.status) where.status = params.status;

    return CalendarRepository.findMany(where);
  }

  static async createEvent(data: any) {
    const event = await CalendarRepository.create(data);
    return event;
  }

  static async updateEvent(id: string, data: any) {
    const event = await CalendarRepository.update(id, data);
    return event;
  }

  static async deleteEvent(id: string) {
    await CalendarRepository.delete(id);
    return { success: true };
  }
}
