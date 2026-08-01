import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface GetClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  businessType?: any; archived?: boolean;
}

export class ClientRepository {
  static async findRecent(take: number = 5) {
    return prisma.client.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
      take
    });
  }

  static async count() {
    return prisma.client.count({ where: { archivedAt: null } });
  }

  static async findMany(params: GetClientsParams) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = { archivedAt: null };

    if (params.search) {
      where.OR = [
        { businessName: { contains: params.search, mode: "insensitive" } },
        { contactPerson: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.businessType) {
      where.businessType = params.businessType;
    }

    const orderBy: Prisma.ClientOrderByWithRelationInput = {};
    if (params.sortBy) {
      orderBy[params.sortBy as keyof Prisma.ClientOrderByWithRelationInput] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          projects: {
            where: { archivedAt: null }
          }
        }
      }),
      prisma.client.count({ where }),
    ]);

    return { clients, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id: string) {
    return prisma.client.findUnique({
      where: { id, archivedAt: null },
      include: {
        projects: {
          where: { archivedAt: null },
          orderBy: { createdAt: "desc" }
        },
        invoices: {
          where: { status: { not: "CANCELLED" } },
          orderBy: { createdAt: "desc" }
        },
        activities: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  static async create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({ data });
  }

  static async update(id: string, data: Prisma.ClientUpdateInput) {
    return prisma.client.update({
      where: { id },
      data
    });
  }

  static async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data: { archivedAt: new Date() }
    });
  }
}
