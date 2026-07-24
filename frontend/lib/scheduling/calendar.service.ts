import { prisma } from "@/lib/prisma";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { CalendarEvent, CalendarEventType, CalendarEventStatus, Prisma } from "@prisma/client";
import { SchedulingEngine } from "./scheduling.engine";

export class CalendarService {
  /**
   * Fetch events within a date range with optional filtering
   */
  static async getEvents(
    startDate: Date,
    endDate: Date,
    filters?: {
      status?: CalendarEventStatus[];
      eventType?: CalendarEventType[];
      projectId?: string;
      clientId?: string;
      leadId?: string;
    }
  ) {
    const where: Prisma.CalendarEventWhereInput = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters?.status) where.status = { in: filters.status };
    if (filters?.eventType) where.eventType = { in: filters.eventType };
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.leadId) where.leadId = filters.leadId;

    return prisma.calendarEvent.findMany({
      where,
      include: {
        project: true,
        client: true,
        lead: true,
        participants: true,
      },
      orderBy: { date: "asc" },
    });
  }

  public static async checkAvailability(
    data: {
      date: Date;
      startTime?: string;
      endTime?: string;
      isAllDay: boolean;
      eventType: string;
      projectId?: string;
      clientId?: string;
      leadId?: string;
      shootId?: string;
      userId?: string;
    },
    validateConflict: boolean = true
  ) {
    // Determine bounds for conflict detection
    if (validateConflict && !data.isAllDay) {
      const start = this.combineDateTime(data.date, data.startTime || null);
      const end = this.combineDateTime(data.date, data.endTime || null);
      
      if (start && end) {
        const requiresTravelTime = data.eventType === 'SHOOT';
        const validation = await SchedulingEngine.validateSlot(start, end, { requiresTravelTime });
        if (!validation.valid) {
          throw new Error(`Scheduling Conflict: ${validation.reason}`);
        }
      }
    }
  }

  /**
   * Create a single event
   */
  static async createEvent(
    data: {
      title: string;
      date: Date;
      startTime?: string;
      endTime?: string;
      isAllDay?: boolean;
      eventType: CalendarEventType;
      color?: string;
      notes?: string;
      projectId?: string;
      clientId?: string;
      leadId?: string;
      shootId?: string;
      userId?: string;
    },
    validateConflict: boolean = true
  ) {
    // Determine bounds for conflict detection
    if (validateConflict && !data.isAllDay) {
      const start = this.combineDateTime(data.date, data.startTime || null);
      const end = this.combineDateTime(data.date, data.endTime || null);
      
      if (start && end) {
        const requiresTravelTime = data.eventType === 'SHOOT';
        const validation = await SchedulingEngine.validateSlot(start, end, { requiresTravelTime });
        if (!validation.valid) {
          throw new Error(`Scheduling Conflict: ${validation.reason}`);
        }
      }
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        isAllDay: data.isAllDay ?? false,
        eventType: data.eventType,
        color: data.color,
        notes: data.notes,
        projectId: data.projectId,
        clientId: data.clientId,
        leadId: data.leadId,
        shootId: data.shootId,
        createdBy: data.userId,
      },
    });

    // Emit workflow event
    EventBus.publish(WorkflowEvent.EVENT_CREATED, {
      eventId: event.id,
      userId: data.userId,
    });

    return event;
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    id: string,
    data: Prisma.CalendarEventUpdateInput,
    userId?: string,
    validateConflict: boolean = true
  ) {
    const existing = await prisma.calendarEvent.findUnique({ where: { id } });
    if (!existing) throw new Error("Event not found");

    if (validateConflict && (data.date || data.startTime || data.endTime)) {
      const newDate = data.date ? new Date(data.date as any) : existing.date;
      const newStartStr = data.startTime !== undefined ? data.startTime : existing.startTime;
      const newEndStr = data.endTime !== undefined ? data.endTime : existing.endTime;
      const isAllDay = data.isAllDay !== undefined ? data.isAllDay : existing.isAllDay;

      if (!isAllDay) {
        const start = this.combineDateTime(newDate, newStartStr as string);
        const end = this.combineDateTime(newDate, newEndStr as string);
        
        if (start && end) {
          const requiresTravelTime = (data.eventType || existing.eventType) === 'SHOOT';
          const validation = await SchedulingEngine.validateSlot(start, end, { 
            ignoreEventId: id,
            requiresTravelTime 
          });
          
          if (!validation.valid) {
            throw new Error(`Scheduling Conflict: ${validation.reason}`);
          }
        }
      }
    }

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      }
    });

    EventBus.publish(WorkflowEvent.EVENT_UPDATED, {
      eventId: updated.id,
      updates: data,
      userId,
    });

    return updated;
  }

  /**
   * Delete / Cancel an event
   */
  static async cancelEvent(id: string, userId?: string) {
    const event = await prisma.calendarEvent.update({
      where: { id },
      data: { 
        status: CalendarEventStatus.CANCELLED,
        updatedBy: userId 
      },
    });

    EventBus.publish(WorkflowEvent.EVENT_CANCELLED, {
      eventId: event.id,
      userId,
    });

    return event;
  }

  // Utilities
  private static combineDateTime(date: Date, timeStr: string | null): Date | null {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}
