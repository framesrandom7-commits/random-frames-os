import { prisma } from "@/lib/prisma";

export class AvailabilityService {
  /**
   * Get working hours for a user
   */
  static async getWorkingHours() {
    return prisma.workingHours.findMany({
      orderBy: { dayOfWeek: "asc" }
    });
  }

  /**
   * Add or update working hours
   */
  static async setWorkingHours(dayOfWeek: number, startTime: string, endTime: string, isActive: boolean) {
    const existing = await prisma.workingHours.findFirst({
      where: { dayOfWeek }
    });

    if (existing) {
      return prisma.workingHours.update({
        where: { id: existing.id },
        data: { startTime, endTime, isActive }
      });
    }

    return prisma.workingHours.create({
      data: { dayOfWeek, startTime, endTime, isActive }
    });
  }

  /**
   * Get blocked dates (holidays + personal availability overrides)
   */
  static async getBlockedDates(startDate: Date, endDate: Date) {
    const holidays = await prisma.holiday.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    });

    const availability = await prisma.availability.findMany({
      where: {
        isBlocked: true,
        date: { gte: startDate, lte: endDate }
      }
    });

    return { holidays, blockedOverrides: availability };
  }

  /**
   * Block a specific date
   */
  static async blockDate(date: Date, reason?: string, userId?: string) {
    return prisma.availability.create({
      data: {
        date,
        reason,
        isBlocked: true,
        userId
      }
    });
  }

  /**
   * Add a holiday
   */
  static async addHoliday(name: string, date: Date, isYearly: boolean = false) {
    return prisma.holiday.create({
      data: {
        name,
        date,
        isYearly
      }
    });
  }
}
