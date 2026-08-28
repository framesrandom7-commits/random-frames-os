import { LeadRepository, GetLeadsParams } from "../repositories/LeadRepository";
import { LeadFormData, LeadUpdateFormData } from "@/lib/validations/lead";
import { LeadStatus, ActivityType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class LeadService {
  static async getDashboardActiveLeads(limit: number = 2) {
    return LeadRepository.findActive(limit);
  }

  static async getLeads(params: GetLeadsParams = {}) {
    const result = await LeadRepository.findMany(params);
    return {
      ...result,
      leads: result.leads.map(lead => ({
        ...lead,
        budget: lead.budget ? Number(lead.budget) : null
      }))
    };
  }

  static async getLead(id: string) {
    const lead = await LeadRepository.findById(id);
    if (!lead) return null;
    return {
      ...lead,
      budget: lead.budget ? Number(lead.budget) : null
    };
  }

  static async checkDuplicates(email?: string | null, phone?: string | null) {
    const duplicates = await LeadRepository.findDuplicates(email, phone);
    return {
      duplicate: duplicates.length > 0,
      matches: duplicates
    };
  }

  static async createLead(data: LeadFormData) {
    const { tags, reminderDate, reminderTime, reminderType, whatsapp, ...leadData } = data;
    
    // Create Lead via repository
    const newLead = await LeadRepository.create({
      ...leadData,
      whatsapp,
      reminders: reminderDate && reminderType ? {
        create: {
          date: new Date(reminderDate),
          time: reminderTime,
          type: reminderType
        }
      } : undefined
    });

    if (tags && Array.isArray(tags) && tags.length > 0) {
      await LeadService.syncTags(newLead.id, tags);
    }

    // Sync Calendar Event
    if (reminderDate && reminderType && (reminderType === "FOLLOW_UP" || reminderType === "MEETING")) {
      await prisma.calendarEvent.create({
        data: {
          title: `${reminderType === "MEETING" ? "Meeting" : "Follow Up"} with ${data.businessName || data.contactPerson}`,
          date: new Date(reminderDate),
          startTime: reminderTime || null,
          eventType: reminderType === "MEETING" ? "MEETING" : "FOLLOW_UP",
          status: "SCHEDULED",
          leadId: newLead.id,
        }
      });
    }

    await prisma.activity.create({
      data: {
        type: ActivityType.STATUS_CHANGE,
        description: `Lead created with status ${data.status || LeadStatus.NEW}`,
        leadId: newLead.id
      }
    });

    return newLead;
  }

  static async updateLead(id: string, data: LeadUpdateFormData) {
    const { tags, id: _id, reminderDate, reminderTime, reminderType, whatsapp, ...leadData } = data;
    
    const updatedLead = await LeadRepository.update(id, {
      ...leadData,
      whatsapp,
    });

    // Handle reminders
    if (reminderDate && reminderType) {
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
      await LeadService.syncTags(id, tags);
    }

    return updatedLead;
  }

  static async updateStatus(id: string, status: LeadStatus) {
    let finalStatus = status;

    // If status updated to WON, ensure a quote exists
    if (status === LeadStatus.WON) {
      const leadData = await LeadRepository.findById(id);
      if (leadData && leadData.email) {
        const { sendClientFormEmail } = await import("@/lib/email");
        const result = await sendClientFormEmail(leadData.id, leadData.email, leadData.businessName || "Client");
        // If quotation has an advance required and no payment recorded, stay at WON or maybe introduce a new status if needed, but for now just stay WON
        finalStatus = LeadStatus.WON;
      }
    }

    const updatedLead = await LeadRepository.update(id, { status: finalStatus });

    await prisma.activity.create({
      data: {
        type: ActivityType.STATUS_CHANGE,
        description: `Status changed to ${finalStatus}`,
        leadId: id
      }
    });

    return updatedLead;
  }

  static async softDelete(id: string) {
    return LeadRepository.softDelete(id);
  }
  
  static async restore(id: string) {
    return LeadRepository.restore(id);
  }

  static async bulkDelete(ids: string[]) {
    return LeadRepository.deleteMany(ids);
  }

  static async bulkUpdateStatus(ids: string[], status: LeadStatus) {
    return LeadRepository.updateManyStatus(ids, status);
  }

  static async addActivity(leadId: string, type: ActivityType, description: string, metadata?: Record<string, unknown>) {
    return prisma.activity.create({
      data: {
        leadId,
        type,
        description,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    });
  }

  static async syncTags(leadId: string, tags: string[]) {
    await prisma.leadTag.deleteMany({ where: { leadId } });
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

  static async getStats(userId?: string) {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalAllTime,
      totalAllTimeLastMonth,
      totalActive,
      totalActiveLastMonth,
      newThisMonth,
      newLastMonth,
      wonThisMonth,
      wonLastMonth,
      totalWonAllTime,
      followUpsToday
    ] = await Promise.all([
      // Total leads
      LeadRepository.count({ archivedAt: null }),
      LeadRepository.count({ archivedAt: null, createdAt: { lte: endOfLastMonth } }),
      
      // Active leads
      LeadRepository.count({
        archivedAt: null,
        status: { notIn: [LeadStatus.CLIENT, LeadStatus.WON, LeadStatus.LOST, LeadStatus.NOT_INTERESTED] }
      }),
      LeadRepository.count({
        archivedAt: null,
        ownerId: userId,
        status: { notIn: [LeadStatus.CLIENT, LeadStatus.WON, LeadStatus.LOST, LeadStatus.NOT_INTERESTED] },
        createdAt: { lte: endOfLastMonth }
      }),

      // New leads
      LeadRepository.count({ archivedAt: null, createdAt: { gte: startOfThisMonth } }),
      LeadRepository.count({ archivedAt: null, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }),

      // Won leads
      LeadRepository.count({
        archivedAt: null,
        status: LeadStatus.CONVERTED,
        updatedAt: { gte: startOfThisMonth }
      }),
      LeadRepository.count({
        archivedAt: null,
        status: LeadStatus.CONVERTED,
        updatedAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }),

      // Total won all time for conversion rate
      LeadRepository.count({ archivedAt: null, status: LeadStatus.CLIENT }),

      // Follow-ups today
      prisma.leadReminder.count({
        where: {
          completed: false,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      })
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const conversionRate = totalAllTime > 0 ? Math.round((totalWonAllTime / totalAllTime) * 100) : 0;

    return { 
      totalAllTime,
      totalAllTimeTrend: calculateTrend(totalAllTime, totalAllTimeLastMonth),
      totalActive,
      totalActiveTrend: calculateTrend(totalActive, totalActiveLastMonth),
      newThisMonth,
      newThisMonthTrend: calculateTrend(newThisMonth, newLastMonth),
      wonThisMonth,
      wonThisMonthTrend: calculateTrend(wonThisMonth, wonLastMonth),
      followUpsToday,
      conversionRate
    };
  }

  static async importLeads(data: LeadFormData[]) {
    const mappedData = data.map(({ tags: _tags, reminderDate: _rd, reminderTime: _rt, reminderType: _rType, ...rest }) => rest);
    return LeadRepository.createMany(mappedData);
  }

  static async updatePhone(id: string, phone: string) {
    const result = await LeadRepository.update(id, { phone });
    await LeadService.addActivity(id, "SYSTEM", `Phone number updated to ${phone}`);
    return result;
  }

  static async addCommunication(leadId: string, type: any, summary: string, details?: string) {
    return LeadRepository.addCommunication({
      type, summary, details, leadId
    });
  }

  static async completeReminder(id: string) {
    const reminder = await LeadRepository.updateReminder(id, { completed: true });
    await prisma.calendarEvent.updateMany({
      where: { leadId: reminder.leadId, date: reminder.date },
      data: { status: "COMPLETED" }
    });
    return reminder;
  }

  static async addAttachment(leadId: string, fileName: string, fileUrl: string, fileSize: number, fileType: string) {
    return LeadRepository.addAttachment({
      fileName, fileUrl, fileSize, fileType, leadId
    });
  }

  static async submitCustomerForm(leadId: string, data: any) {
    let combinedNotes = data.notes || "";
    if (data.whatsapp) combinedNotes += `\nWhatsApp: ${data.whatsapp}`;
    if (data.gstNumber) combinedNotes += `\nGST Number: ${data.gstNumber}`;

    await LeadRepository.update(leadId, {
      contactPerson: data.contactPerson,
      phone: data.phone,
      email: data.email,
      businessName: data.businessName,
      address: data.address,
      instagram: data.instagram,
      website: data.website,
      notes: combinedNotes,
    });

    await LeadService.addActivity(leadId, ActivityType.NOTE, "Customer onboarding form submitted");
    return true;
  }

  static async markAsLost(id: string, reason: string, remarks?: string) {
    await LeadRepository.update(id, {
      status: LeadStatus.LOST,
      lostReason: reason as any,
      closingRemarks: remarks
    });
    await LeadService.addActivity(id, ActivityType.STATUS_CHANGE, `Lead marked as lost. Reason: ${reason}`);
    return true;
  }

  static async convertLead(id: string) {
    const lead = await LeadRepository.findById(id);
    if (!lead) return false;
    
    const clientCount = await prisma.client.count();
    const clientCode = `CLI-${new Date().getFullYear()}-${String(clientCount + 1).padStart(4, "0")}`;

    const client = await prisma.client.create({
      data: {
        clientCode,
        businessName: lead.businessName || "Unknown Business",
        contactPerson: lead.contactPerson,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: lead.email,
        instagram: lead.instagram,
        website: lead.website,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        country: lead.country,
        postalCode: lead.postalCode,
        notes: lead.notes,
        businessType: lead.businessType,
        preferredContactMethod: lead.preferredContactMethod,
        createdBy: lead.createdById
      }
    });

    await LeadRepository.update(id, { 
      status: LeadStatus.CLIENT,
      convertedToClient: { connect: { id: client.id } }
    });

    await prisma.activity.create({
      data: {
        type: ActivityType.STATUS_CHANGE,
        description: "Lead successfully converted to Client",
        leadId: id,
        clientId: client.id
      }
    });
    
    const { EventBus } = await import("@/lib/workflow/event-bus");
    const { WorkflowEvent } = await import("@/lib/workflow/events");
    EventBus.publish(WorkflowEvent.CLIENT_CREATED, { clientId: client.id, userId: lead.createdById || undefined });

    return true;
  }
}
