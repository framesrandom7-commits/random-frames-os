import { prisma } from "@/lib/prisma";
import { Prisma, LeadStatus, LeadPriority, LeadSource } from "@prisma/client";
import { ACTIVE_LEAD_STATUSES } from "../lead/status";

export interface GetLeadsParams {
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  ownerId?: string;
  createdDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  archived?: boolean;
}

export class LeadRepository {
  static async findActive(take?: number) {
    return prisma.lead.findMany({
      where: { status: { in: ACTIVE_LEAD_STATUSES }, archivedAt: null },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async findMany(params: GetLeadsParams) {
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
        { phone: { contains: params.search, mode: "insensitive" } },
        { whatsapp: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.status) where.status = params.status;
    if (params.priority) where.priority = params.priority;
    if (params.source) where.leadSource = params.source;
    if (params.ownerId) where.ownerId = params.ownerId;
    
    if (params.createdDate) {
      const date = new Date(params.createdDate);
      where.createdAt = {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lte: new Date(date.setHours(23, 59, 59, 999))
      };
    }

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
          leadTags: {
            include: { tag: true }
          },
          reminders: true,
          owner: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.lead.count({ where }),
    ]);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id: string) {
    return prisma.lead.findUnique({
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
  }

  static async create(data: Prisma.LeadCreateInput) {
    return prisma.lead.create({ data });
  }

  static async update(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({
      where: { id },
      data
    });
  }

  static async softDelete(id: string) {
    return prisma.lead.update({
      where: { id },
      data: { archivedAt: new Date() }
    });
  }

  static async restore(id: string) {
    return prisma.lead.update({
      where: { id },
      data: { archivedAt: null }
    });
  }

  static async deleteMany(ids: string[]) {
    return prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { archivedAt: new Date() }
    });
  }

  static async count(where: Prisma.LeadWhereInput) {
    return prisma.lead.count({ where });
  }

  static async findDuplicates(email?: string | null, phone?: string | null) {
    if (!email && !phone) return [];
    
    const where: Prisma.LeadWhereInput = { archivedAt: null, OR: [] };
    if (email) where.OR!.push({ email: { equals: email, mode: "insensitive" } });
    if (phone) {
      where.OR!.push({ phone: { equals: phone } });
      where.OR!.push({ whatsapp: { equals: phone } });
    }
    
    return prisma.lead.findMany({
      where,
      select: { id: true, businessName: true, email: true, phone: true, whatsapp: true }
    });
  }

  static async updateManyStatus(ids: string[], status: LeadStatus) {
    return prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: { status }
    });
  }

  static async createMany(data: any[]) {
    return prisma.lead.createMany({
      data,
      skipDuplicates: true
    });
  }

  static async addAttachment(data: any) {
    return prisma.leadAttachment.create({ data });
  }

  static async addCommunication(data: any) {
    return prisma.leadCommunication.create({ data });
  }

  static async updateReminder(id: string, data: any) {
    return prisma.leadReminder.update({
      where: { id },
      data
    });
  }
}
