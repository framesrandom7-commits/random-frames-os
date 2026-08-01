import { EventBus } from "../event-bus";
import { WorkflowEvent } from "../events";
import { NotificationCenter, NotificationChannel } from "@/domain/integrations/notification-manager";
import { prisma } from "@/lib/prisma";

export function registerCalendarHandlers() {
  // Triggered when ReminderService processes a pending reminder
  EventBus.subscribe(WorkflowEvent.REMINDER_TRIGGERED, "SendReminderNotification", async (payload) => {
    const reminder = await prisma.reminder.findUnique({
      where: { id: payload.reminderId },
      include: { event: true, task: true, project: true }
    });

    if (!reminder) return;

    // Convert Prisma ReminderChannel to NotificationChannel
    let channel = NotificationChannel.IN_APP;
    if (reminder.type === 'EMAIL') channel = NotificationChannel.EMAIL;
    if (reminder.type === 'WHATSAPP') channel = NotificationChannel.WHATSAPP;

    await NotificationCenter.dispatch({
      title: reminder.title,
      message: reminder.description || `Reminder for ${reminder.event?.title || reminder.task?.title}`,
      type: 'GENERAL_REMINDER',
      projectId: reminder.projectId || undefined,
      channels: [channel],
    });
  });

  EventBus.subscribe(WorkflowEvent.EVENT_CREATED, "TimelineEventCreated", async (payload) => {
    // Add to activity timeline
    const event = await prisma.calendarEvent.findUnique({ where: { id: payload.eventId }});
    if (!event) return;

    await prisma.activity.create({
      data: {
        type: 'SYSTEM',
        description: `Scheduled a new event: ${event.title}`,
        projectId: event.projectId,
        clientId: event.clientId,
        leadId: event.leadId,
        shootId: event.shootId,
        metadata: { eventId: event.id, date: event.date },
        createdBy: payload.userId,
      }
    });
  });

  EventBus.subscribe(WorkflowEvent.TASK_COMPLETED, "TimelineTaskCompleted", async (payload) => {
    const task = await prisma.task.findUnique({ where: { id: payload.taskId }});
    if (!task) return;

    await prisma.activity.create({
      data: {
        type: 'SYSTEM',
        description: `Completed task: ${task.title}`,
        projectId: task.projectId,
        clientId: task.clientId,
        leadId: task.leadId,
        metadata: { taskId: task.id },
        createdBy: payload.userId,
      }
    });
  });

  EventBus.subscribe(WorkflowEvent.EVENT_CREATED, "SyncGoogleCalendarCreate", async (payload: any) => {
    const { QueueManager } = await import("@/domain/integrations/queue-manager");
    const { CALENDAR_CONSTANTS } = await import("@/domain/calendar/constants");
    await QueueManager.pushJob(
      CALENDAR_CONSTANTS.PROVIDER_ID,
      'SYNC_GOOGLE_CALENDAR',
      { crmEventId: payload.eventId }
    );
  });

  EventBus.subscribe(WorkflowEvent.EVENT_UPDATED, "SyncGoogleCalendarUpdate", async (payload: any) => {
    const { QueueManager } = await import("@/domain/integrations/queue-manager");
    const { CALENDAR_CONSTANTS } = await import("@/domain/calendar/constants");
    await QueueManager.pushJob(
      CALENDAR_CONSTANTS.PROVIDER_ID,
      'SYNC_GOOGLE_CALENDAR',
      { crmEventId: payload.eventId }
    );
  });

  EventBus.subscribe(WorkflowEvent.EVENT_CANCELLED, "DeleteGoogleCalendarEvent", async (payload: any) => {
    const { QueueManager } = await import("@/domain/integrations/queue-manager");
    const { CALENDAR_CONSTANTS } = await import("@/domain/calendar/constants");
    await QueueManager.pushJob(
      CALENDAR_CONSTANTS.PROVIDER_ID,
      'DELETE_GOOGLE_CALENDAR_EVENT',
      { googleEventId: payload.googleEventId }
    );
  });
}
