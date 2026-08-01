"use server";

import { verifySession as getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { CALENDAR_CONSTANTS } from '@/domain/calendar/constants';

export async function getCalendarSettings() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: CALENDAR_CONSTANTS.PROVIDER_ID }
    });

    const { CredentialManager } = await import('@/domain/integrations/credential-manager');
    const hasCreds = await CredentialManager.hasCredentials(CALENDAR_CONSTANTS.PROVIDER_ID);

    return { 
      success: true, 
      connected: hasCreds,
      calendarId: settings?.calendarId,
      lastSyncAt: settings?.lastSyncAt
    };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:getCalendarSettings");
  }
}

export async function fetchGoogleCalendars() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const { GoogleCalendarRepository } = await import('@/domain/calendar/repository');
    const calendars = await GoogleCalendarRepository.listCalendars();

    return { success: true, calendars };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:fetchGoogleCalendars");
  }
}

export async function saveSelectedCalendar(calendarId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    await prisma.integrationSettings.upsert({
      where: { provider: CALENDAR_CONSTANTS.PROVIDER_ID },
      update: { calendarId },
      create: { 
        provider: CALENDAR_CONSTANTS.PROVIDER_ID,
        calendarId,
        userId: session.userId
      }
    });

    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:saveSelectedCalendar");
  }
}

export async function forceSyncCalendar() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    // Simply push a queue job for every future event to ensure sync
    const events = await prisma.calendarEvent.findMany({
      where: { 
        date: { gte: new Date() } // Sync future events
      }
    });

    const { QueueManager } = await import('@/domain/integrations/queue-manager');

    for (const event of events) {
      await QueueManager.pushJob(
        CALENDAR_CONSTANTS.PROVIDER_ID,
        'SYNC_GOOGLE_CALENDAR',
        { crmEventId: event.id }
      );
    }

    return { success: true, queuedCount: events.length };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:forceSyncCalendar");
  }
}
