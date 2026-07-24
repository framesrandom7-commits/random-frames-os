"use server";

import { prisma } from "@/lib/prisma";
import { CalendarEventType, CalendarEventStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export async function getCalendarEvents(params?: {
  dateStart?: string;
  dateEnd?: string;
  clientId?: string;
  projectId?: string;
  eventType?: CalendarEventType;
  status?: CalendarEventStatus;
}) {
  try {
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

    const events = await prisma.calendarEvent.findMany({
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

    return events;
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
    const event = await prisma.calendarEvent.create({
      data: {
        ...data,
      },
    });
    revalidatePath("/calendar");
    return event;
  } catch (error) {
  console.error("Error in createCalendarEvent:", error);
  return GlobalErrorService.handleError(error, "Action:createCalendarEvent");
}
}

export async function updateCalendarEvent(
  id: string,
  data: Partial<{
    title: string;
    date: Date;
    startTime: string | null;
    endTime: string | null;
    isAllDay: boolean;
    eventType: CalendarEventType;
    status: CalendarEventStatus;
    color: string | null;
    clientId: string | null;
    projectId: string | null;
    shootId: string | null;
    leadId: string | null;
    notes: string | null;
  }>
) {
  try {
    const event = await prisma.calendarEvent.update({
      where: { id },
      data,
    });
    revalidatePath("/calendar");
    return event;
  } catch (error) {
  console.error("Error in updateCalendarEvent:", error);
  return GlobalErrorService.handleError(error, "Action:updateCalendarEvent");
}
}

export async function deleteCalendarEvent(id: string) {
  try {
    await prisma.calendarEvent.delete({
      where: { id },
    });
    revalidatePath("/calendar");
  } catch (error) {
  console.error("Error in deleteCalendarEvent:", error);
  return GlobalErrorService.handleError(error, "Action:deleteCalendarEvent");
}
}
