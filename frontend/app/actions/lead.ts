"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, Lead, LeadStatus, LeadPriority, LeadSource, ActivityType, CommunicationType, BusinessType, ReminderType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { LeadFormData, LeadUpdateFormData } from "@/lib/validations/lead";

export interface GetLeadsParams {
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  archived?: boolean;
}

export async function getLeads(params?: GetLeadsParams) {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      archivedAt: params?.archived ? { not: null } : null,
    };

    if (params?.search) {
      where.OR = [
        { businessName: { contains: params.search, mode: "insensitive" } },
        { contactPerson: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params?.status) where.status = params.status;
    if (params?.priority) where.priority = params.priority;
    if (params?.source) where.leadSource = params.source;

    const orderBy: Prisma.LeadOrderByWithRelationInput = {};
    if (params?.sortBy) {
      orderBy[params.sortBy as keyof Prisma.LeadOrderByWithRelationInput] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          leadTags: {
            include: { tag: true }
          },
          reminders: true
        }
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error("Error fetching leads:", error);
    return { leads: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
}

export async function getLead(id: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id, archivedAt: null },
      include: {
        activities: {
          orderBy: { createdAt: "desc" }
        },
        communications: {
          orderBy: { createdAt: "desc" }
        },
        reminders: {
          orderBy: { date: "asc" }
        },
        attachments: {
          orderBy: { createdAt: "desc" }
        },
        leadTags: {
          include: { tag: true }
        }
      }
    });

    return lead;
  } catch (error) {
    console.error("Error fetching lead:", error);
    return null;
  }
}

async function syncTags(leadId: string, tags: string[]) {
  // Clear existing lead tags
  await prisma.leadTag.deleteMany({ where: { leadId } });

  // Create tags if they don't exist and link them
  for (const tagName of tags) {
    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName }
    });
    
    await prisma.leadTag.create({
      data: {
        leadId,
        tagId: tag.id
      }
    });
  }
}

export async function createLead(data: LeadFormData) {
  try {
    const { tags, reminderDate, reminderTime, reminderType, ...leadData } = data;
    
    const newLead = await prisma.lead.create({
      data: {
        ...leadData,
        reminders: reminderDate && reminderType ? {
          create: {
            date: new Date(reminderDate),
            time: reminderTime,
            type: reminderType
          }
        } : undefined
      },
    });
    
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await syncTags(newLead.id, tags);
    }
    
    // Sync CalendarEvent
    if (reminderDate && reminderType && (reminderType === "FOLLOW_UP" || reminderType === "MEETING")) {
      await prisma.calendarEvent.create({
        data: {
          title: `${reminderType === "MEETING" ? "Meeting" : "Follow Up"} with ${data.businessName}`,
          date: new Date(reminderDate),
          startTime: reminderTime || null,
          eventType: reminderType === "MEETING" ? "MEETING" : "FOLLOW_UP",
          status: "SCHEDULED",
          leadId: newLead.id,
        }
      });
    }
    
    await prisma.leadActivity.create({
      data: {
        type: ActivityType.STATUS_CHANGE,
        description: `Lead created with status ${data.status || LeadStatus.NEW}`,
        leadId: newLead.id
      }
    });
    
    revalidatePath("/leads");
    return newLead;
  } catch (error) {
    console.error("Error creating lead:", error);
    return null;
  }
}

export async function updateLead(id: string, data: LeadUpdateFormData) {
  try {
    const { tags, id: _id, reminderDate, reminderTime, reminderType, ...leadData } = data;
    
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: leadData,
    });
    
    if (reminderDate && reminderType) {
      // For simplicity, just delete existing incomplete reminders and recreate
      await prisma.leadReminder.deleteMany({
        where: { leadId: id, completed: false }
      });
      await prisma.leadReminder.create({
        data: {
          leadId: id,
          date: new Date(reminderDate),
          time: reminderTime,
          type: reminderType
        }
      });
      
      // Sync CalendarEvent
      await prisma.calendarEvent.deleteMany({ where: { leadId: id, eventType: { in: ["FOLLOW_UP", "MEETING"] } } });
      if (reminderType === "FOLLOW_UP" || reminderType === "MEETING") {
        await prisma.calendarEvent.create({
          data: {
            title: `${reminderType === "MEETING" ? "Meeting" : "Follow Up"} with ${data.businessName || "Lead"}`,
            date: new Date(reminderDate),
            startTime: reminderTime || null,
            eventType: reminderType === "MEETING" ? "MEETING" : "FOLLOW_UP",
            status: "SCHEDULED",
            leadId: id,
          }
        });
      }
    } else {
      await prisma.calendarEvent.deleteMany({ where: { leadId: id, eventType: { in: ["FOLLOW_UP", "MEETING"] } } });
    }

    if (tags && Array.isArray(tags)) {
      await syncTags(id, tags);
    }
    
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead:", error);
    return null;
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status },
    });
    
    await prisma.leadActivity.create({
      data: {
        type: ActivityType.STATUS_CHANGE,
        description: `Lead status changed to ${status}`,
        leadId: id
      }
    });
    
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead status:", error);
    return null;
  }
}

export async function softDeleteLead(id: string): Promise<boolean> {
  try {
    await prisma.lead.update({
      where: { id },
      data: { archivedAt: new Date() }
    });
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error soft deleting lead:", error);
    return false;
  }
}

export async function addLeadActivity(leadId: string, type: ActivityType, description: string, metadata?: Record<string, unknown>) {
  try {
    const activity = await prisma.leadActivity.create({
      data: {
        type,
        description,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        leadId
      }
    });
    revalidatePath(`/leads/${leadId}`);
    return activity;
  } catch (error) {
    console.error("Error adding activity:", error);
    return null;
  }
}

export async function addLeadCommunication(leadId: string, type: CommunicationType, summary: string, details?: string) {
  try {
    const comm = await prisma.leadCommunication.create({
      data: {
        type,
        summary,
        details,
        leadId
      }
    });
    revalidatePath(`/leads/${leadId}`);
    return comm;
  } catch (error) {
    console.error("Error adding communication:", error);
    return null;
  }
}

export async function getLeadStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [total, newLeads, contacted, won, lost, dueToday, overdue] = await Promise.all([
      prisma.lead.count({ where: { archivedAt: null } }),
      prisma.lead.count({ where: { archivedAt: null, status: LeadStatus.NEW } }),
      prisma.lead.count({ where: { archivedAt: null, status: LeadStatus.CONTACTED } }),
      prisma.lead.count({ where: { archivedAt: null, status: LeadStatus.WON } }),
      prisma.lead.count({ where: { archivedAt: null, status: LeadStatus.LOST } }),
      prisma.lead.count({
        where: {
          archivedAt: null,
          reminders: {
            some: {
              date: { gte: todayStart, lt: todayEnd },
              completed: false
            }
          },
          status: { notIn: [LeadStatus.WON, LeadStatus.LOST] }
        }
      }),
      prisma.lead.count({
        where: {
          archivedAt: null,
          reminders: {
            some: {
              date: { lt: todayStart },
              completed: false
            }
          },
          status: { notIn: [LeadStatus.WON, LeadStatus.LOST] }
        }
      })
    ]);

    const conversionRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentLeads = await prisma.lead.findMany({
      where: {
        archivedAt: null,
        createdAt: { gte: sixMonthsAgo }
      },
      select: { createdAt: true }
    });

    const monthlyTrend = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthStr = date.toLocaleString('default', { month: 'short' });
      return {
        name: monthStr,
        total: recentLeads.filter(l => l.createdAt.getMonth() === date.getMonth() && l.createdAt.getFullYear() === date.getFullYear()).length
      };
    });

    return {
      total,
      newLeads,
      contacted,
      won,
      lost,
      dueToday,
      overdue,
      conversionRate,
      monthlyTrend
    };
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return null;
  }
}

export async function importLeads(data: LeadFormData[]): Promise<boolean> {
  try {
    // Basic import logic - stripping tags and reminders for standard insert
    // Future: batch insert reminders using createMany as well if needed.
    const mappedData = data.map(({ tags: _tags, reminderDate: _rd, reminderTime: _rt, reminderType: _rType, ...rest }) => rest);
    await prisma.lead.createMany({
      data: mappedData,
      skipDuplicates: true,
    });
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error importing leads:", error);
    return false;
  }
}

export async function bulkDeleteLeads(ids: string[]): Promise<boolean> {
  try {
    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { archivedAt: new Date() }
    });
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error bulk deleting leads:", error);
    return false;
  }
}

export async function bulkUpdateLeadStatus(ids: string[], status: LeadStatus): Promise<boolean> {
  try {
    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { status }
    });
    
    // Create activities for each
    const activities = ids.map(id => ({
      type: ActivityType.STATUS_CHANGE,
      description: `Lead status bulk changed to ${status}`,
      leadId: id
    }));
    await prisma.leadActivity.createMany({ data: activities });
    
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error bulk updating status:", error);
    return false;
  }
}

export async function restoreLead(id: string): Promise<boolean> {
  try {
    await prisma.lead.update({
      where: { id },
      data: { archivedAt: null }
    });
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error restoring lead:", error);
    return false;
  }
}

export async function completeReminder(id: string): Promise<boolean> {
  try {
    const reminder = await prisma.leadReminder.update({
      where: { id },
      data: { completed: true }
    });
    
    // Sync CalendarEvent completion
    await prisma.calendarEvent.updateMany({
      where: { leadId: reminder.leadId, date: reminder.date },
      data: { status: "COMPLETED" }
    });
    
    revalidatePath(`/leads/${reminder.leadId}`);
    revalidatePath("/calendar");
    return true;
  } catch (error) {
    console.error("Error completing reminder:", error);
    return false;
  }
}

export async function addLeadAttachment(leadId: string, fileName: string, fileUrl: string, fileSize: number, fileType: string) {
  try {
    const attachment = await prisma.leadAttachment.create({
      data: {
        fileName,
        fileUrl,
        fileSize,
        fileType,
        leadId
      }
    });
    revalidatePath(`/leads/${leadId}`);
    return attachment;
  } catch (error) {
    console.error("Error adding attachment:", error);
    return null;
  }
}

export type LeadWithRelations = NonNullable<Awaited<ReturnType<typeof getLead>>>;
export type LeadListWithRelations = Awaited<ReturnType<typeof getLeads>>["leads"][number];
