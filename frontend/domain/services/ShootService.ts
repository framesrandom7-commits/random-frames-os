import { ShootRepository, GetShootsParams } from "../repositories/ShootRepository";
import { CreateShootData } from "@/app/actions/shoot";
import { prisma } from "@/lib/prisma";
import { EventBus } from "../events/EventBus";

export class ShootService {
  static async getDashboardUpcomingShoots(limit: number = 4) {
    return ShootRepository.findUpcoming(limit);
  }

  static async generateCode(): Promise<string> {
    const count = await ShootRepository.count();
    const sequential = (count + 1).toString().padStart(3, '0');
    return `RF-S${sequential}`;
  }

  static async create(data: CreateShootData) {
    const shootCode = await ShootService.generateCode();
    
    const { clientId, projectId, ...shootData } = data;

    const shoot = await ShootRepository.create({
      ...shootData,
      shootCode,
      client: { connect: { id: clientId } },
      project: { connect: { id: projectId } },
      ...(data.date ? {
        calendarEvents: {
          create: {
            title: `Shoot: ${data.title}`,
            date: data.date,
            startTime: data.startTime || null,
            endTime: data.endTime || null,
            eventType: "SHOOT",
            status: data.status === "COMPLETED" ? "COMPLETED" : (data.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED"),
            clientId: data.clientId,
            projectId: data.projectId,
          }
        }
      } : {})
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Shoot scheduled: ${shoot.title}`,
      shootId: shoot.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    const { verifySession } = await import('@/lib/auth');
    const session = await verifySession();
    
    const { WorkflowEvent } = await import('@/lib/workflow/events');
    EventBus.emit(WorkflowEvent.SHOOT_SCHEDULED, {
      shootId: shoot.id,
      projectId: data.projectId,
      userId: session?.userId,
    });

    return shoot;
  }

  static async update(id: string, data: Partial<CreateShootData>) {
    const shoot = await ShootRepository.update(id, data);
    
    if (shoot.date) {
      const existingEvent = await prisma.calendarEvent.findFirst({ where: { shootId: id } });
      const status = shoot.status === "COMPLETED" ? "COMPLETED" : (shoot.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED");
      if (existingEvent) {
        await prisma.calendarEvent.update({
          where: { id: existingEvent.id },
          data: {
            title: `Shoot: ${shoot.title}`,
            date: shoot.date,
            startTime: shoot.startTime || null,
            endTime: shoot.endTime || null,
            status,
          }
        });
      } else {
        await prisma.calendarEvent.create({
          data: {
            title: `Shoot: ${shoot.title}`,
            date: shoot.date,
            startTime: shoot.startTime || null,
            endTime: shoot.endTime || null,
            eventType: "SHOOT",
            status,
            clientId: shoot.clientId,
            projectId: shoot.projectId,
            shootId: shoot.id,
          }
        });
      }
    } else {
      await prisma.calendarEvent.deleteMany({ where: { shootId: id } });
    }

    if (data.status) {
      const allShoots = await prisma.shoot.findMany({ where: { projectId: shoot.projectId } });
      let newProjectStatus = undefined;
      
      const allCompleted = allShoots.every(s => s.status === "COMPLETED");
      const anyInProgress = allShoots.some(s => s.status === "UPCOMING");
      
      if (allCompleted) {
        newProjectStatus = "COMPLETED";
      } else if (anyInProgress) {
        newProjectStatus = "SHOOTING";
      }

      if (newProjectStatus) {
        await prisma.project.update({
          where: { id: shoot.projectId },
          data: { status: newProjectStatus as any }
        });
      }
    }
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "STATUS_CHANGE",
      description: `Shoot updated: ${shoot.title}`,
      shootId: shoot.id,
      projectId: shoot.projectId,
      clientId: shoot.clientId,
    });

    return shoot;
  }

  static async softDelete(id: string) {
    return ShootRepository.softDelete(id);
  }

  static async duplicate(id: string) {
    const existingShoot = await ShootRepository.findById(id);
    if (!existingShoot) throw new Error("Shoot not found");

    const shootCode = await ShootService.generateCode();
    
    const { id: _, shootCode: __, createdAt, updatedAt, archivedAt, equipment, shots, project, assignedUsers, ...shootData } = existingShoot as any;

    const newShoot = await ShootRepository.create({
      ...shootData,
      shootCode,
      title: `${shootData.title} (Copy)`,
      status: "UPCOMING",
      equipment: {
        create: equipment.map((e: any) => ({ name: e.name, status: "REQUIRED" }))
      },
      shots: {
        create: shots.map((s: any) => ({ title: s.title, description: s.description, order: s.order, isCompleted: false }))
      }
    });

    return newShoot;
  }

  static async getById(id: string) {
    return ShootRepository.findById(id);
  }

  static async getMany(params: GetShootsParams) {
    return ShootRepository.findMany(params);
  }

  static async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todaysShoots,
      upcomingShoots,
      thisWeekShoots,
      completedThisMonth,
      cancelledShoots,
      pendingDeliveries
    ] = await Promise.all([
      ShootRepository.count({ archivedAt: null, date: { gte: startOfToday, lte: endOfToday }, status: { notIn: ["CANCELLED"] } }),
      ShootRepository.count({ archivedAt: null, date: { gt: endOfToday }, status: "UPCOMING" }),
      ShootRepository.count({ archivedAt: null, date: { gte: startOfWeek, lte: endOfWeek }, status: { notIn: ["CANCELLED"] } }),
      ShootRepository.count({ archivedAt: null, status: "COMPLETED", date: { gte: startOfMonth } }),
      ShootRepository.count({ archivedAt: null, status: "CANCELLED" }),
      prisma.project.count({
        where: { archivedAt: null, status: { notIn: ["DELIVERED", "COMPLETED", "CANCELLED"] }, shoots: { some: { status: "COMPLETED" } } }
      })
    ]);

    return {
      todaysShoots,
      upcomingShoots,
      thisWeekShoots,
      completedThisMonth,
      cancelledShoots,
      pendingDeliveries
    };
  }

  static async addEquipment(shootId: string, name: string) {
    return ShootRepository.addEquipment({ shoot: { connect: { id: shootId } }, name });
  }

  static async toggleEquipment(id: string, isCompleted: boolean) {
    return ShootRepository.updateEquipment(id, { status: isCompleted ? "PACKED" : "REQUIRED" });
  }

  static async deleteEquipment(id: string) {
    return ShootRepository.deleteEquipment(id);
  }

  static async addShot(shootId: string, title: string, description: string, order: number) {
    return ShootRepository.addShot({ shoot: { connect: { id: shootId } }, title, description, order });
  }

  static async toggleShot(id: string, isCompleted: boolean) {
    return ShootRepository.updateShot(id, { isCompleted });
  }

  static async deleteShot(id: string) {
    return ShootRepository.deleteShot(id);
  }

  static async reorderShots(orderedIds: string[]) {
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.shootShot.update({
          where: { id },
          data: { order: index }
        })
      )
    );
  }
}
