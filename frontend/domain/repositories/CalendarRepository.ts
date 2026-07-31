import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class CalendarRepository {
  static async findMany(where: Prisma.CalendarEventWhereInput) {
    return prisma.calendarEvent.findMany({
      where,
      include: {
        client: true,
        project: true,
        shoot: true,
        lead: true,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });
  }

  static async findById(id: string) {
    return prisma.calendarEvent.findUnique({ where: { id } });
  }

  static async create(data: Prisma.CalendarEventCreateInput) {
    return prisma.calendarEvent.create({ data });
  }

  static async update(id: string, data: Prisma.CalendarEventUpdateInput) {
    return prisma.calendarEvent.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.calendarEvent.delete({ where: { id } });
  }
}
