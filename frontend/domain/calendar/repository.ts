import { getCalendarService } from "@/lib/google";
import { Logger } from "@/lib/logger";
import { GoogleCalendarEvent, GoogleCalendarListEntry } from "./types";
import { prisma } from "@/lib/prisma";
import { CALENDAR_CONSTANTS } from "./constants";

export class GoogleCalendarRepository {
  /**
   * Fetches the user's calendars.
   */
  static async listCalendars(): Promise<GoogleCalendarListEntry[]> {
    try {
      const calendar = await getCalendarService();
      const response = await calendar.calendarList.list();
      return (response.data.items || []).map(item => ({
        id: item.id!,
        summary: item.summary!,
        primary: item.primary || false
      }));
    } catch (error) {
      Logger.error("Failed to list Google Calendars", error);
      throw error;
    }
  }

  /**
   * Creates an event in Google Calendar.
   */
  static async createEvent(calendarId: string, event: GoogleCalendarEvent): Promise<string> {
    try {
      const calendar = await getCalendarService();
      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      if (!response.data.id) throw new Error("Google Calendar returned null ID");
      return response.data.id;
    } catch (error) {
      Logger.error(`Failed to create Google Calendar event`, error);
      throw error;
    }
  }

  /**
   * Updates an existing event in Google Calendar.
   */
  static async updateEvent(calendarId: string, eventId: string, event: GoogleCalendarEvent): Promise<string> {
    try {
      const calendar = await getCalendarService();
      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });

      return response.data.id!;
    } catch (error) {
      Logger.error(`Failed to update Google Calendar event ${eventId}`, error);
      throw error;
    }
  }

  /**
   * Deletes an event from Google Calendar.
   */
  static async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      const calendar = await getCalendarService();
      await calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      Logger.error(`Failed to delete Google Calendar event ${eventId}`, error);
      throw error;
    }
  }

  /**
   * Gets the saved calendar ID from settings.
   */
  static async getSelectedCalendarId(): Promise<string | null> {
    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: CALENDAR_CONSTANTS.PROVIDER_ID }
    });
    return settings?.calendarId || null;
  }
}
