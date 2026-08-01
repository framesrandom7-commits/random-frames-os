import { prisma } from "@/lib/prisma";
import { GoogleCalendarRepository } from "./repository";
import { GoogleCalendarEvent } from "./types";
import { AuditManager } from "@/domain/integrations/audit-manager";
import { CALENDAR_CONSTANTS } from "./constants";
import { Logger } from "@/lib/logger";

export class CalendarDomainService {
  /**
   * Synchronizes a CRM CalendarEvent to Google Calendar.
   */
  static async syncEventToGoogle(crmEventId: string): Promise<void> {
    const crmEvent = await prisma.calendarEvent.findUnique({
      where: { id: crmEventId },
      include: {
        client: true,
        project: true,
      }
    });

    if (!crmEvent) {
      Logger.warn(`CalendarEvent ${crmEventId} not found, skipping sync`);
      return;
    }

    const calendarId = await GoogleCalendarRepository.getSelectedCalendarId();
    if (!calendarId) {
      throw new Error("No Google Calendar selected for synchronization");
    }

    // Convert CRM Event to Google Event format
    const startObj: any = {};
    const endObj: any = {};

    if (crmEvent.isAllDay) {
      // For all-day events, Google expects YYYY-MM-DD
      const dateStr = crmEvent.date.toISOString().split('T')[0];
      startObj.date = dateStr;
      
      // End date must be exclusive (+1 day)
      const endDate = new Date(crmEvent.date);
      endDate.setDate(endDate.getDate() + 1);
      endObj.date = endDate.toISOString().split('T')[0];
    } else {
      // Time-based events
      if (!crmEvent.startTime || !crmEvent.endTime) {
        throw new Error("Missing start/end time for non-all-day event");
      }
      
      const dateStr = crmEvent.date.toISOString().split('T')[0];
      const startDateTime = new Date(`${dateStr}T${crmEvent.startTime}:00`);
      const endDateTime = new Date(`${dateStr}T${crmEvent.endTime}:00`);
      
      startObj.dateTime = startDateTime.toISOString();
      endObj.dateTime = endDateTime.toISOString();
    }

    let summary = crmEvent.title;
    if (crmEvent.client) {
      summary = `[${crmEvent.client.businessName}] ${summary}`;
    }

    const googleEvent: GoogleCalendarEvent = {
      summary,
      description: crmEvent.notes || undefined,
      start: startObj,
      end: endObj,
      extendedProperties: {
        private: {
          crmEventId: crmEvent.id
        }
      }
    };

    try {
      if (crmEvent.googleCalendarEventId) {
        // Update existing
        await GoogleCalendarRepository.updateEvent(calendarId, crmEvent.googleCalendarEventId, googleEvent);
        
        await AuditManager.logIntegrationEvent(
          CALENDAR_CONSTANTS.PROVIDER_ID,
          "EVENT_UPDATED",
          `Updated Google Calendar event for CRM Event ${crmEvent.title}`,
          { crmEventId, googleEventId: crmEvent.googleCalendarEventId },
          { clientId: crmEvent.clientId || undefined, projectId: crmEvent.projectId || undefined }
        );
      } else {
        // Create new
        const newGoogleEventId = await GoogleCalendarRepository.createEvent(calendarId, googleEvent);
        
        // Save the Google ID back to the CRM database
        await prisma.calendarEvent.update({
          where: { id: crmEvent.id },
          data: { googleCalendarEventId: newGoogleEventId }
        });

        await AuditManager.logIntegrationEvent(
          CALENDAR_CONSTANTS.PROVIDER_ID,
          "EVENT_CREATED",
          `Created Google Calendar event for CRM Event ${crmEvent.title}`,
          { crmEventId, googleEventId: newGoogleEventId },
          { clientId: crmEvent.clientId || undefined, projectId: crmEvent.projectId || undefined }
        );
      }
    } catch (error) {
      await AuditManager.logIntegrationEvent(
        CALENDAR_CONSTANTS.PROVIDER_ID,
        "SYNC_FAILED",
        `Failed to sync event ${crmEvent.title}`,
        { crmEventId, error: (error as Error).message },
        { clientId: crmEvent.clientId || undefined, projectId: crmEvent.projectId || undefined }
      );
      throw error;
    }
  }

  /**
   * Deletes an event from Google Calendar when deleted in CRM.
   */
  static async deleteGoogleEvent(googleEventId: string): Promise<void> {
    const calendarId = await GoogleCalendarRepository.getSelectedCalendarId();
    if (!calendarId) return; // Skip silently if no calendar configured

    try {
      await GoogleCalendarRepository.deleteEvent(calendarId, googleEventId);
      
      await AuditManager.logIntegrationEvent(
        CALENDAR_CONSTANTS.PROVIDER_ID,
        "EVENT_DELETED",
        `Deleted Google Calendar event ${googleEventId}`,
        { googleEventId }
      );
    } catch (error: any) {
      Logger.warn(`Failed to delete Google Calendar event ${googleEventId}`, { error: error?.message || String(error) });
      // We don't necessarily throw here if we just want to suppress deletion errors (e.g., event already gone)
    }
  }
}
