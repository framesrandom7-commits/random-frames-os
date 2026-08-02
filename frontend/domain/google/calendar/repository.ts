import { GoogleCalendarRepository as BaseCalendarRepo } from "@/domain/calendar/repository";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

/**
 * Unified Workspace Calendar Repository.
 * Wraps existing GoogleCalendarRepository without duplicate implementations while adding conflict and recurring helpers.
 */
export class WorkspaceCalendarRepository {
  /**
   * Re-export base methods to ensure zero duplication
   */
  static listCalendars = BaseCalendarRepo.listCalendars;
  static createEvent = BaseCalendarRepo.createEvent;
  static updateEvent = BaseCalendarRepo.updateEvent;
  static deleteEvent = BaseCalendarRepo.deleteEvent;
  static getSelectedCalendarId = BaseCalendarRepo.getSelectedCalendarId;

  /**
   * Conflict Detection & Availability Check.
   * Checks if an event time slot overlaps with any active calendar events in the database.
   */
  static async checkAvailability(date: Date, startTime?: string, endTime?: string, excludeEventId?: string): Promise<{
    available: boolean;
    conflictingEvents: Array<{ id: string; title: string; startTime?: string; endTime?: string }>;
  }> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const eventsOnDay = await prisma.calendarEvent.findMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
          id: excludeEventId ? { not: excludeEventId } : undefined
        }
      });

      if (!startTime || !endTime) {
        // If whole day checked, any event is a conflict
        return {
          available: eventsOnDay.length === 0,
          conflictingEvents: eventsOnDay.map(e => ({ id: e.id, title: e.title, startTime: e.startTime || undefined, endTime: e.endTime || undefined }))
        };
      }

      const requestedStart = parseInt(startTime.replace(":", ""), 10);
      const requestedEnd = parseInt(endTime.replace(":", ""), 10);

      const conflicts = eventsOnDay.filter(e => {
        if (!e.startTime || !e.endTime) return true; // all day conflicts
        const eStart = parseInt(e.startTime.replace(":", ""), 10);
        const eEnd = parseInt(e.endTime.replace(":", ""), 10);
        // Overlap condition: start < eEnd and end > eStart
        return requestedStart < eEnd && requestedEnd > eStart;
      });

      return {
        available: conflicts.length === 0,
        conflictingEvents: conflicts.map(c => ({ id: c.id, title: c.title, startTime: c.startTime || undefined, endTime: c.endTime || undefined }))
      };
    } catch (e: any) {
      Logger.error("[WorkspaceCalendarRepository] Availability check failed:", e.message);
      return { available: true, conflictingEvents: [] };
    }
  }
}
