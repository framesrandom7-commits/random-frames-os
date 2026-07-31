import { prisma } from "./prisma";
import { getCalendarService } from "./google";
import { QueueService } from "./queue.service";
import { Logger } from "./logger";

export class GCalService {
  /**
   * Syncs a shoot to Google Calendar
   * Fail-safe execution guaranteed.
   */
  static async syncShootEvent(shootId: string): Promise<boolean> {
    try {
      const shoot = await prisma.shoot.findUnique({
        where: { id: shootId },
        include: { 
          project: { include: { client: true } },
          calendarEvents: true
        }
      });

      if (!shoot || !shoot.date) throw new Error("Shoot not found or missing date");

      const calSettings = await prisma.integrationSettings.findUnique({
        where: { provider: "GOOGLE_CALENDAR" }
      });

      if (!calSettings || !calSettings.accessToken) {
        Logger.warn("[GCalService] Calendar not connected. Skipping sync.");
        return false;
      }

      const calendar = await getCalendarService();

      const startTime = new Date(shoot.date);
      const endTime = new Date(shoot.date.getTime() + 4 * 60 * 60 * 1000); // add 4 hrs default

      const eventBody = {
        summary: `Shoot: ${shoot.title} | ${shoot.project.client.businessName}`,
        description: `Project: ${shoot.project.title}\nType: ${shoot.shootType}\nNotes: ${shoot.notes || ''}`,
        location: shoot.location || '',
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
      };

      const existingEvent = shoot.calendarEvents[0]; // Assume first one is the main shoot event

      if (existingEvent && existingEvent.googleCalendarEventId) {
        // Update existing
        await calendar.events.update({
          calendarId: 'primary',
          eventId: existingEvent.googleCalendarEventId,
          requestBody: eventBody,
        });
      } else {
        // Create new
        const res = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: eventBody,
        });

        if (res.data.id) {
          if (existingEvent) {
             await prisma.calendarEvent.update({
               where: { id: existingEvent.id },
               data: { googleCalendarEventId: res.data.id }
             });
          } else {
             await prisma.calendarEvent.create({
               data: {
                 title: `Shoot: ${shoot.title}`,
                 date: startTime,
                 eventType: 'SHOOT',
                 googleCalendarEventId: res.data.id,
                 shootId: shoot.id,
                 projectId: shoot.projectId,
                 clientId: shoot.project.clientId
               }
             });
          }
        }
      }

      return true;
    } catch (error: any) {
      Logger.error(`[GCalService] Failed to sync shoot event for ${shootId}`, error);
      await QueueService.pushJob("GOOGLE_CALENDAR", "SYNC_SHOOT_EVENT", { shootId }, error.message);
      return false;
    }
  }

  static async deleteShootEvent(calendarEventId: string): Promise<boolean> {
    try {
      const calendar = await getCalendarService();
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: calendarEventId,
      });
      return true;
    } catch (error: any) {
      Logger.error(`[GCalService] Failed to delete event ${calendarEventId}`, error);
      await QueueService.pushJob("GOOGLE_CALENDAR", "DELETE_EVENT", { calendarEventId }, error.message);
      return false;
    }
  }
}
