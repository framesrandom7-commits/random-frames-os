import { prisma } from "@/lib/prisma";
import { CalendarEvent, CalendarEventType, CalendarEventStatus, Availability, WorkingHours, Holiday } from "@prisma/client";

export class SchedulingEngine {
  /**
   * Validates if a proposed event slot is available and doesn't conflict
   * with existing events, working hours, or blocked dates.
   */
  static async validateSlot(
    startTime: Date, 
    endTime: Date, 
    options?: { ignoreEventId?: string; requiresTravelTime?: boolean }
  ): Promise<{ valid: boolean; reason?: string }> {
    
    // 1. Check Working Hours
    const isWithinWorkingHours = await this.checkWorkingHours(startTime, endTime);
    if (!isWithinWorkingHours) {
      return { valid: false, reason: "Proposed time is outside of standard working hours." };
    }

    // 2. Check Holidays / Blocked Dates
    const isBlocked = await this.checkBlockedDates(startTime, endTime);
    if (isBlocked) {
      return { valid: false, reason: "Proposed time falls on a blocked date or holiday." };
    }

    // 3. Check Exact or Partial Overlap
    const conflict = await this.detectConflict(startTime, endTime, options?.ignoreEventId);
    if (conflict) {
      return { valid: false, reason: `Conflicts with existing event: ${conflict.title}` };
    }

    // 4. (Optional) Check buffer / travel time. 
    // Example: If it's a SHOOT, ensure 2 hours buffer before and after any other shoot.
    if (options?.requiresTravelTime) {
      const bufferConflict = await this.detectBufferConflict(startTime, endTime, 120, options?.ignoreEventId);
      if (bufferConflict) {
        return { valid: false, reason: `Not enough travel/buffer time. Conflicts closely with: ${bufferConflict.title}` };
      }
    }

    return { valid: true };
  }

  static async detectConflict(startTime: Date, endTime: Date, ignoreEventId?: string): Promise<CalendarEvent | null> {
    const overlappingEvent = await prisma.calendarEvent.findFirst({
      where: {
        id: ignoreEventId ? { not: ignoreEventId } : undefined,
        status: { not: CalendarEventStatus.CANCELLED },
        AND: [
          {
            date: { lte: endTime }
          },
          // For simplicity in Phase 8, we handle event boundaries using startTime/endTime strings or Date extensions.
          // Since the schema stores `date` (DateTime) and `startTime` (String e.g. "14:00"), 
          // we need to combine them for robust overlap detection, but Prisma doesn't support complex string-to-time queries natively.
          // In a production scenario, we'd store a pure `startDateTime` and `endDateTime`.
          // For now, we will fetch events on that day and filter in JS to be safe, or just rely on date for all-day events.
        ]
      }
    });

    // Note: A robust implementation would store `startDateTime` and `endDateTime` on the model.
    // Since the schema has `date` (DateTime) + `startTime` (String), we fetch events on that day.
    const startDay = new Date(startTime);
    startDay.setHours(0, 0, 0, 0);
    
    const endDay = new Date(endTime);
    endDay.setHours(23, 59, 59, 999);

    const dailyEvents = await prisma.calendarEvent.findMany({
      where: {
        id: ignoreEventId ? { not: ignoreEventId } : undefined,
        status: { not: CalendarEventStatus.CANCELLED },
        date: {
          gte: startDay,
          lte: endDay,
        }
      }
    });

    for (const event of dailyEvents) {
      if (event.isAllDay) return event; // All day event blocks the whole day
      
      const eventStart = this.combineDateTime(event.date, event.startTime);
      const eventEnd = this.combineDateTime(event.date, event.endTime);
      
      if (!eventStart || !eventEnd) continue;

      // Overlap logic: A starts before B ends AND A ends after B starts
      if (startTime < eventEnd && endTime > eventStart) {
        return event;
      }
    }

    return null;
  }

  static async detectBufferConflict(startTime: Date, endTime: Date, bufferMinutes: number, ignoreEventId?: string): Promise<CalendarEvent | null> {
    // Subtract buffer from start, add buffer to end
    const bufferedStart = new Date(startTime.getTime() - bufferMinutes * 60000);
    const bufferedEnd = new Date(endTime.getTime() + bufferMinutes * 60000);
    
    return this.detectConflict(bufferedStart, bufferedEnd, ignoreEventId);
  }

  private static async checkWorkingHours(startTime: Date, endTime: Date): Promise<boolean> {
    const dayOfWeek = startTime.getDay();
    const workingHours = await prisma.workingHours.findFirst({
      where: { dayOfWeek, isActive: true }
    });

    if (!workingHours) return false; // Not a working day

    // Compare times
    const startStr = this.toTimeString(startTime);
    const endStr = this.toTimeString(endTime);

    if (startStr < workingHours.startTime || endStr > workingHours.endTime) {
      return false;
    }

    return true;
  }

  private static async checkBlockedDates(startTime: Date, endTime: Date): Promise<boolean> {
    const startDay = new Date(startTime);
    startDay.setHours(0,0,0,0);
    
    const holiday = await prisma.holiday.findFirst({
      where: { date: startDay }
    });
    if (holiday) return true;

    const blocked = await prisma.availability.findFirst({
      where: { date: startDay, isBlocked: true }
    });
    
    if (blocked) return true;

    return false;
  }

  private static combineDateTime(date: Date, timeStr: string | null): Date | null {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private static toTimeString(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}
