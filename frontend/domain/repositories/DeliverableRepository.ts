import { prisma } from "@/lib/prisma";
import { ACTIVE_DELIVERABLE_STATUSES } from "../deliverable/status";

export class DeliverableRepository {
  static async findUpcoming(take?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.deliverable.findMany({
      where: { 
        dueDate: { gte: today },
        status: { in: ACTIVE_DELIVERABLE_STATUSES }
      },
      include: { shoot: { include: { project: true } } },
      orderBy: { dueDate: "asc" },
      ...(take ? { take } : {})
    });
  }

  static async findActive(take?: number) {
    return prisma.deliverable.findMany({
      where: { status: { in: ACTIVE_DELIVERABLE_STATUSES } },
      include: { shoot: { include: { project: { include: { client: true } } } } },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async findPendingDue(dueDateLessThan: Date, take?: number) {
    return prisma.deliverable.findMany({
      where: {
        dueDate: { lt: dueDateLessThan },
        status: { in: ["PENDING", "EDITING"] }
      },
      include: { shoot: { include: { project: true } } },
      orderBy: { dueDate: "asc" },
      ...(take ? { take } : {})
    });
  }

  static async findForReview(take?: number) {
    return prisma.deliverable.findMany({
      where: {
        status: { in: ["READY_FOR_REVIEW", "CHANGES_REQUESTED"] }
      },
      include: { shoot: { include: { project: true } } },
      orderBy: { updatedAt: "desc" },
      ...(take ? { take } : {})
    });
  }

  static async findById(id: string) {
    return prisma.deliverable.findUnique({
      where: { id },
      include: { shoot: { select: { projectId: true, clientId: true } } }
    });
  }

  static async create(data: any) {
    return prisma.deliverable.create({
      data,
      include: { shoot: { select: { projectId: true, clientId: true } } }
    });
  }

  static async update(id: string, data: any) {
    return prisma.deliverable.update({
      where: { id },
      data,
      include: { shoot: { select: { projectId: true, clientId: true } } }
    });
  }

  static async delete(id: string) {
    return prisma.deliverable.delete({ where: { id } });
  }

  static async createFile(data: any) {
    return prisma.deliverableFile.create({
      data,
      include: { deliverable: { include: { shoot: true } } }
    });
  }

  static async deleteFile(id: string) {
    return prisma.deliverableFile.delete({ where: { id } });
  }

  static async findFileById(id: string) {
    return prisma.deliverableFile.findUnique({
      where: { id },
      include: { deliverable: true }
    });
  }

  static async createVersion(data: any) {
    return prisma.deliverableVersion.create({
      data,
      include: { deliverable: { include: { shoot: true } } }
    });
  }

  static async findHighestVersion(deliverableId: string) {
    return prisma.deliverableVersion.findFirst({
      where: { deliverableId },
      orderBy: { versionNumber: 'desc' }
    });
  }

  static async findByShoot(shootId: string) {
    return prisma.deliverable.findMany({
      where: { shootId },
      include: {
        files: { orderBy: { uploadedAt: "desc" } },
        versions: { orderBy: { versionNumber: "desc" } }
      },
      orderBy: { createdAt: "asc" }
    });
  }

  static async findPending(take?: number) {
    return prisma.deliverable.findMany({
      where: {
        status: { in: ["PENDING", "EDITING", "CHANGES_REQUESTED"] }
      },
      include: { shoot: { include: { project: true } } },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ],
      ...(take ? { take } : {})
    });
  }
}
