import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ACTIVE_SHOOT_STATUSES } from "../shoot/status";

export interface GetShootsParams {
  page?: number;
  limit?: number;
  search?: string;
  projectId?: string;
  status?: string;
  archived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  assignedUserId?: string;
  clientId?: string;
  shootType?: string;
}

export class ShootRepository {
  static async findActive(take?: number) {
    return prisma.shoot.findMany({
      where: { status: { in: ACTIVE_SHOOT_STATUSES } },
      include: { project: { include: { client: true } } },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async findUpcoming(take?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.shoot.findMany({
      where: { 
        status: { in: ACTIVE_SHOOT_STATUSES },
        date: { gte: today }
      },
      include: { project: { include: { client: true } } },
      orderBy: { date: "asc" },
      ...(take ? { take } : {})
    });
  }

  static async count(where?: Prisma.ShootWhereInput) {
    return prisma.shoot.count({ where });
  }

  static async findMany(params: GetShootsParams) {
    const {
      page = 1,
      limit = 50,
      search = "",
      projectId,
      status,
      archived = false,
      sortBy = "date",
      sortOrder = "asc",
      dateFrom,
      dateTo,
      assignedUserId,
      clientId,
      shootType,
    } = params;

    const where: any = {};
    
    if (archived) {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (shootType) {
      where.shootType = shootType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shootCode: { contains: search, mode: "insensitive" } },
        { project: { title: { contains: search, mode: "insensitive" } } },
        { project: { client: { businessName: { contains: search, mode: "insensitive" } } } },
      ];
    }

    if (status) where.status = status;
    
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom);
      if (dateTo) where.date.lte = new Date(dateTo);
    }
    
    if (assignedUserId) {
      where.assignedUsers = {
        some: { id: assignedUserId }
      };
    }

    const skip = (page - 1) * limit;

    const [shoots, total] = await Promise.all([
      prisma.shoot.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          client: true,
          project: {
            include: {
              client: true
            }
          },
          equipment: true,
        }
      }),
      prisma.shoot.count({ where }),
    ]);

    return { shoots, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async findById(id: string) {
    return prisma.shoot.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true
          }
        },
        shots: {
          orderBy: { order: "asc" }
        },
        equipment: {
          orderBy: { name: "asc" }
        }
      }
    });
  }

  static async create(data: Prisma.ShootCreateInput) {
    return prisma.shoot.create({ data });
  }

  static async update(id: string, data: Prisma.ShootUpdateInput) {
    return prisma.shoot.update({
      where: { id },
      data
    });
  }

  static async softDelete(id: string) {
    return prisma.shoot.update({
      where: { id },
      data: { archivedAt: new Date() }
    });
  }

  static async addEquipment(data: Prisma.ShootEquipmentCreateInput) {
    return prisma.shootEquipment.create({ data });
  }

  static async updateEquipment(id: string, data: Prisma.ShootEquipmentUpdateInput) {
    return prisma.shootEquipment.update({ where: { id }, data });
  }

  static async deleteEquipment(id: string) {
    return prisma.shootEquipment.delete({ where: { id } });
  }

  static async addShot(data: Prisma.ShootShotCreateInput) {
    return prisma.shootShot.create({ data });
  }

  static async updateShot(id: string, data: Prisma.ShootShotUpdateInput) {
    return prisma.shootShot.update({ where: { id }, data });
  }

  static async deleteShot(id: string) {
    return prisma.shootShot.delete({ where: { id } });
  }
}
