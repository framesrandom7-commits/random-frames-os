import { prisma } from "@/lib/prisma";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { ReminderChannel } from "@prisma/client";

export class ReminderService {
  /**
   * Schedule a new reminder for an event or task
   */
  static async scheduleReminder(data: {
    title: string;
    description?: string;
    triggerDate: Date;
    type?: ReminderChannel;
    eventId?: string;
    taskId?: string;
    projectId?: string;
  }) {
    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        description: data.description,
        triggerDate: data.triggerDate,
        type: data.type || ReminderChannel.IN_APP,
        eventId: data.eventId,
        taskId: data.taskId,
        projectId: data.projectId,
      },
    });

    return reminder;
  }

  /**
   * Evaluates pending reminders and triggers them via Workflow Event
   * This would typically be called by a CRON job or background worker.
   */
  static async processPendingReminders() {
    const now = new Date();
    
    // Find all reminders that are due but not yet sent
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        isSent: false,
        triggerDate: {
          lte: now
        }
      },
      include: {
        event: true,
        task: true,
        project: true
      }
    });

    for (const reminder of pendingReminders) {
      try {
        // Emit the workflow event. The Notification Engine handles actual delivery.
        EventBus.publish(WorkflowEvent.REMINDER_TRIGGERED, {
          reminderId: reminder.id,
          type: reminder.type
        });

        // Mark as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { isSent: true }
        });
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
      }
    }

    return pendingReminders.length;
  }
}
