import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ACTIVE_PROJECT_STATUSES, EDITABLE_PROJECT_STATUSES, ARCHIVED_PROJECT_STATUSES } from "../project/status";

export interface GetProjectsParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  status?: string;
  priority?: string;
  paymentStatus?: string;
  archived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  assignedUserId?: string;
}

export class ProjectRepository {
  static async findActive(take?: number) {
    return prisma.project.findMany({
      where: { status: { in: ACTIVE_PROJECT_STATUSES } },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async findEditable(take?: number) {
    return prisma.project.findMany({
      where: { status: { in: EDITABLE_PROJECT_STATUSES } },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async findArchived(take?: number) {
    return prisma.project.findMany({
      where: { status: { in: ARCHIVED_PROJECT_STATUSES } },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async count(where?: Prisma.ProjectWhereInput) {
    return prisma.project.count({ where });
  }

  static async aggregate(args: Prisma.ProjectAggregateArgs) {
    return prisma.project.aggregate(args);
  }

  static async findMany(params: GetProjectsParams) {
    const {
      page = 1,
      limit = 50,
      search = "",
      clientId,
      status,
      priority,
      paymentStatus,
      archived = false,
      sortBy = "createdAt",
      sortOrder = "desc",
      assignedUserId,
    } = params;

    const where: any = {};
    
    if (archived) {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { projectCode: { contains: search, mode: "insensitive" } },
        { client: { businessName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (assignedUserId) {
      where.assignedUsers = {
        some: { id: assignedUserId }
      };
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          client: true,
          assignedUsers: true,
        }
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        assignedUsers: true,
        activities: {
          orderBy: { createdAt: "desc" }
        },
        invoices: { where: { status: { not: "CANCELLED" } } },
        payments: true,
        expenses: true,
      }
    });
  }

  static async create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data });
  }

  static async update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data
    });
  }

  static async softDelete(id: string) {
    return prisma.project.update({
      where: { id },
      data: { archivedAt: new Date() }
    });
  }
}
