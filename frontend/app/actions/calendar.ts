"use server";

import { CalendarEventType, CalendarEventStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CalendarService } from "@/domain/services/CalendarService";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { prisma } from "@/lib/prisma";

export async function getCalendarEvents(params?: {
  dateStart?: string;
  dateEnd?: string;
  clientId?: string;
  projectId?: string;
  eventType?: CalendarEventType;
  status?: CalendarEventStatus;
}) {
  try {
    return await CalendarService.getEvents(params);
  } catch (error) {
    console.error("Error in getCalendarEvents:", error);
    return GlobalErrorService.handleError(error, "Action:getCalendarEvents");
  }
}

export async function createCalendarEvent(data: {
  title: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  eventType: CalendarEventType;
  status?: CalendarEventStatus;
  color?: string;
  clientId?: string;
  projectId?: string;
  shootId?: string;
  leadId?: string;
  notes?: string;
}) {
  try {
    const event = await CalendarService.createEvent(data);
    revalidatePath("/calendar");
    if (data.clientId) revalidatePath(`/clients/${data.clientId}/workspace`);
    return { success: true, event };
  } catch (error) {
    console.error("Error in createCalendarEvent:", error);
    return GlobalErrorService.handleError(error, "Action:createCalendarEvent");
  }
}

export async function updateCalendarEvent(
  id: string,
  data: any
) {
  try {
    const event = await CalendarService.updateEvent(id, data);
    revalidatePath("/calendar");
    if (event.clientId) revalidatePath(`/clients/${event.clientId}/workspace`);
    return { success: true, event };
  } catch (error) {
    console.error("Error in updateCalendarEvent:", error);
    return GlobalErrorService.handleError(error, "Action:updateCalendarEvent");
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    const event = await prisma.calendarEvent.findUnique({ where: { id }});
    await CalendarService.deleteEvent(id);
    revalidatePath("/calendar");
    if (event?.clientId) revalidatePath(`/clients/${event.clientId}/workspace`);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteCalendarEvent:", error);
    return GlobalErrorService.handleError(error, "Action:deleteCalendarEvent");
  }
}
