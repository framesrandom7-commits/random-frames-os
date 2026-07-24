import { prisma } from "@/lib/prisma";
import { RecurringFrequency, CalendarEventType } from "@prisma/client";
import { RRule, Frequency } from "rrule";
import { CalendarService } from "./calendar.service";

export class RecurringEventService {
  /**
   * Create a recurring rule and generate all its child events up to the end date or count limit.
   */
  static async createRecurringEvent(
    baseEventData: {
      title: string;
      startTime?: string;
      endTime?: string;
      isAllDay?: boolean;
      eventType: CalendarEventType;
      color?: string;
      projectId?: string;
      clientId?: string;
      userId?: string;
    },
    ruleData: {
      startDate: Date;
      frequency: RecurringFrequency;
      interval?: number;
      endDate?: Date;
      count?: number;
    }
  ) {
    // Determine RRule frequency mapping
    const freqMap: Record<RecurringFrequency, Frequency> = {
      [RecurringFrequency.DAILY]: RRule.DAILY,
      [RecurringFrequency.WEEKLY]: RRule.WEEKLY,
      [RecurringFrequency.MONTHLY]: RRule.MONTHLY,
      [RecurringFrequency.YEARLY]: RRule.YEARLY,
    };

    const rruleOptions: any = {
      freq: freqMap[ruleData.frequency],
      dtstart: ruleData.startDate,
      interval: ruleData.interval || 1,
    };

    if (ruleData.endDate) rruleOptions.until = ruleData.endDate;
    if (ruleData.count) rruleOptions.count = ruleData.count;

    // Safety limit for event generation if no end date/count provided
    if (!ruleData.endDate && !ruleData.count) {
      rruleOptions.count = 50; 
    }

    const rule = new RRule(rruleOptions);
    const occurrences = rule.all();

    // 1. Save the rule to DB
    const recurringRule = await prisma.recurringRule.create({
      data: {
        frequency: ruleData.frequency,
        interval: ruleData.interval || 1,
        endDate: ruleData.endDate,
        count: ruleData.count,
      }
    });

    // 2. Generate and save each occurrence
    const createdEvents = [];
    for (const occurrenceDate of occurrences) {
      // In a robust production app, we would batch this.
      // We will skip conflict validation for batch recurring generation to avoid partial failures,
      // or we can validate and collect errors. Here we create directly for speed.
      const event = await prisma.calendarEvent.create({
        data: {
          title: baseEventData.title,
          date: occurrenceDate,
          startTime: baseEventData.startTime,
          endTime: baseEventData.endTime,
          isAllDay: baseEventData.isAllDay ?? false,
          eventType: baseEventData.eventType,
          color: baseEventData.color,
          projectId: baseEventData.projectId,
          clientId: baseEventData.clientId,
          createdBy: baseEventData.userId,
          recurringRuleId: recurringRule.id,
        }
      });
      createdEvents.push(event);
    }

    return { rule: recurringRule, events: createdEvents };
  }
}
