import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { logActivity } from "@/lib/timeline";

export class LeadService {
  /**
   * Retrieves paginated leads with advanced filtering
   */
  public static async getLeads(params: any) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      archivedAt: params.archived ? { not: null } : null,
    };

    if (params.search) {
      where.OR = [
        { businessName: { contains: params.search, mode: "insensitive" } },
        { contactPerson: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.source) where.leadSource = params.source;

    const orderBy: Prisma.LeadOrderByWithRelationInput = {};
    if (params.sortBy) {
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
          leadTags: { include: { tag: true } },
          reminders: true
        }
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public static async getLead(id: string) {
    return prisma.lead.findUnique({
      where: { id, archivedAt: null },
      include: {
        activities: { orderBy: { createdAt: "desc" } },
        communications: { orderBy: { createdAt: "desc" } },
        reminders: { orderBy: { date: "asc" } },
        attachments: { orderBy: { createdAt: "desc" } },
        leadTags: { include: { tag: true } }
      }
    });
  }

  public static async createLead(data: any, userId?: string) {
    const lead = await prisma.lead.create({ data });

    await logActivity({
      type: "SYSTEM",
      description: "Lead created",
      leadId: lead.id,
      createdBy: userId
    });

    EventBus.publish(WorkflowEvent.LEAD_CREATED, {
      leadId: lead.id,
      userId
    });

    return lead;
  }

  public static async updateLead(id: string, data: any, userId?: string) {
    const lead = await prisma.lead.update({
      where: { id },
      data
    });

    if (data.status) {
      await logActivity({
        type: "STATUS_CHANGE",
        description: `Status changed to ${data.status}`,
        leadId: id,
        createdBy: userId
      });
      EventBus.publish(WorkflowEvent.LEAD_UPDATED, { leadId: id, updates: data, userId });
    }

    return lead;
  }

  public static async deleteLead(id: string) {
    return prisma.lead.delete({ where: { id } });
  }

  public static async getLeadStats() {
    const [totalLeads, openLeads, convertedLeads] = await Promise.all([
      prisma.lead.count({ where: { archivedAt: null } }),
      prisma.lead.count({ where: { status: "NEW", archivedAt: null } }),
      prisma.lead.count({ where: { convertedToClientId: { not: null }, archivedAt: null } }),
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      openLeads,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  }
}
