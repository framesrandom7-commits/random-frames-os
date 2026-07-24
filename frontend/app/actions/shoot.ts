"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ShootType, ShootStatus } from "@prisma/client";

export async function generateShootCode(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await prisma.shoot.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), 1),
      }
    }
  });

  const sequential = (count + 1).toString().padStart(3, '0');
  return `SH${year}${month}${sequential}`;
}

export type CreateShootData = {
  clientId: string;
  projectId: string;
  title: string;
  shootType?: ShootType;
  status?: ShootStatus;
  date?: Date | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  googleMapsLink?: string | null;
  photographer?: string | null;
  videographer?: string | null;
  assistants?: string | null;
  droneOperator?: string | null;
  editor?: string | null;
  makeupArtist?: string | null;
  callTime?: string | null;
  wrapTime?: string | null;
  timeZone?: string | null;
  clientBrief?: string | null;
  specialRequests?: string | null;
  moodBoard?: string | null;
  referenceImages?: string | null;
  deliverablesChecklist?: string | null;
};

export async function createShoot(data: CreateShootData) {
  try {
    const shootCode = await generateShootCode();
    
    const shoot = await prisma.shoot.create({
      data: {
        ...data,
        shootCode,
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
      }
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Shoot scheduled: ${shoot.title}`,
      shootId: shoot.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    const { verifySession: getSession } = await import('@/lib/auth');
    const session = await getSession();
    const { EventBus } = await import('@/lib/workflow/event-bus');
    const { WorkflowEvent } = await import('@/lib/workflow/events');
    EventBus.publish(WorkflowEvent.SHOOT_SCHEDULED, {
      shootId: shoot.id,
      projectId: data.projectId,
      userId: session?.userId,
    });
    
    revalidatePath("/shoots");
    revalidatePath(`/projects/${data.projectId}`);
    revalidatePath(`/clients/${data.clientId}`);
    revalidatePath("/calendar");
    return { success: true, shoot };
  } catch (error) {
    console.error("Error creating shoot:", error);
    return { success: false, error: "Failed to create shoot" };
  }
}

export async function updateShoot(id: string, data: Partial<CreateShootData>) {
  try {
    const shoot = await prisma.shoot.update({
      where: { id },
      data,
    });
    
    // Sync CalendarEvent
    if (shoot.date) {
      const existingEvent = await prisma.calendarEvent.findFirst({ where: { shootId: id } });
      if (existingEvent) {
        await prisma.calendarEvent.update({
          where: { id: existingEvent.id },
          data: {
            title: `Shoot: ${shoot.title}`,
            date: shoot.date,
            startTime: shoot.startTime || null,
            endTime: shoot.endTime || null,
            status: shoot.status === "COMPLETED" ? "COMPLETED" : (shoot.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED"),
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
            status: shoot.status === "COMPLETED" ? "COMPLETED" : (shoot.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED"),
            clientId: shoot.clientId,
            projectId: shoot.projectId,
            shootId: shoot.id,
          }
        });
      }
    } else {
      await prisma.calendarEvent.deleteMany({ where: { shootId: id } });
    }

    // Sync Project Status
    if (data.status) {
      const allShoots = await prisma.shoot.findMany({ where: { projectId: shoot.projectId } });
      let newProjectStatus = undefined;
      
      const allCompleted = allShoots.every(s => s.status === "COMPLETED");
      const anyInProgress = allShoots.some(s => s.status === "IN_PROGRESS" || s.status === "EDITING" || s.status === "READY_FOR_REVIEW");
      
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
    
    revalidatePath("/shoots");
    revalidatePath(`/shoots/${id}`);
    revalidatePath(`/projects/${shoot.projectId}`);
    revalidatePath(`/clients/${shoot.clientId}`);
    revalidatePath("/calendar");
    return { success: true, shoot };
  } catch (error) {
    console.error("Error updating shoot:", error);
    return { success: false, error: "Failed to update shoot" };
  }
}

export async function deleteShoot(id: string) {
  try {
    const shoot = await prisma.shoot.update({
      where: { id },
      data: {
        archivedAt: new Date()
      }
    });
    
    revalidatePath("/shoots");
    revalidatePath(`/projects/${shoot.projectId}`);
    revalidatePath(`/clients/${shoot.clientId}`);
    revalidatePath("/calendar");
    return true;
  } catch (error) {
    console.error("Error deleting shoot:", error);
    return false;
  }
}

export async function duplicateShoot(id: string) {
  try {
    const existingShoot = await prisma.shoot.findUnique({
      where: { id },
      include: {
        equipment: true,
        shots: true
      }
    });

    if (!existingShoot) {
      return { success: false, error: "Shoot not found" };
    }

    const shootCode = await generateShootCode();
    
     
    const { id: _, shootCode: __, createdAt, updatedAt, archivedAt, equipment, shots, ...shootData } = existingShoot;

    const newShoot = await prisma.shoot.create({
      data: {
        ...shootData,
        shootCode,
        title: `${shootData.title} (Copy)`,
        status: "PLANNED",
        equipment: {
          create: equipment.map(e => ({ name: e.name, status: "REQUIRED" }))
        },
        shots: {
          create: shots.map(s => ({ title: s.title, description: s.description, order: s.order, isCompleted: false }))
        }
      }
    });

    revalidatePath("/shoots");
    revalidatePath(`/projects/${newShoot.projectId}`);
    revalidatePath(`/clients/${newShoot.clientId}`);
    revalidatePath("/calendar");
    return { success: true, shoot: newShoot };
  } catch (error) {
    console.error("Error duplicating shoot:", error);
    return { success: false, error: "Failed to duplicate shoot" };
  }
}

export async function getShoot(id: string) {
  try {
    return await prisma.shoot.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        equipment: true,
        shots: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching shoot:", error);
    return null;
  }
}

export type GetShootsParams = {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  projectId?: string;
  status?: ShootStatus | "";
  shootType?: ShootType | "";
  archived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateStart?: Date;
  dateEnd?: Date;
};

export async function getShoots(params: GetShootsParams = {}) {
  const {
    page = 1,
    limit = 50,
    search = "",
    clientId,
    projectId,
    status,
    shootType,
    archived = false,
    sortBy = "date",
    sortOrder = "asc",
    dateStart,
    dateEnd
  } = params;

  try {
    const where: any = {};
    
    if (archived) {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }

    if (clientId) where.clientId = clientId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (shootType) where.shootType = shootType;

    if (dateStart || dateEnd) {
      where.date = {};
      if (dateStart) where.date.gte = dateStart;
      if (dateEnd) where.date.lte = dateEnd;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { shootCode: { contains: search, mode: "insensitive" } },
        { client: { businessName: { contains: search, mode: "insensitive" } } },
        { project: { title: { contains: search, mode: "insensitive" } } },
      ];
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
          project: true
        }
      }),
      prisma.shoot.count({ where }),
    ]);

    return {
      shoots,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching shoots:", error);
    return { shoots: [], total: 0, totalPages: 0, currentPage: page };
  }
}

export async function getShootStats() {
  try {
    const now = new Date();
    // Start of today in local time approach
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
      prisma.shoot.count({ 
        where: { archivedAt: null, date: { gte: startOfToday, lte: endOfToday }, status: { notIn: ["CANCELLED", "POSTPONED"] } } 
      }),
      prisma.shoot.count({ 
        where: { archivedAt: null, date: { gt: endOfToday }, status: "PLANNED" } 
      }),
      prisma.shoot.count({ 
        where: { archivedAt: null, date: { gte: startOfWeek, lte: endOfWeek }, status: { notIn: ["CANCELLED"] } } 
      }),
      prisma.shoot.count({ 
        where: { archivedAt: null, status: "COMPLETED", date: { gte: startOfMonth } } 
      }),
      prisma.shoot.count({ 
        where: { archivedAt: null, status: "CANCELLED" } 
      }),
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
  } catch (error) {
    console.error("Error fetching shoot stats:", error);
    return {
      todaysShoots: 0,
      upcomingShoots: 0,
      thisWeekShoots: 0,
      completedThisMonth: 0,
      cancelledShoots: 0,
      pendingDeliveries: 0
    };
  }
}

// Sub-model Actions

export async function addEquipment(shootId: string, name: string) {
  try {
    const equip = await prisma.shootEquipment.create({
      data: { shootId, name }
    });
    revalidatePath(`/shoots/${shootId}`);
    return { success: true, equipment: equip };
  } catch (error) {
    console.error("Error adding equipment:", error);
    return { success: false, error: "Failed to add equipment" };
  }
}

export async function toggleEquipment(id: string, isCompleted: boolean, shootId: string) {
  try {
    await prisma.shootEquipment.update({
      where: { id },
      data: { status: isCompleted ? "PACKED" : "REQUIRED" }
    });
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error toggling equipment:", error);
    return false;
  }
}

export async function deleteEquipment(id: string, shootId: string) {
  try {
    await prisma.shootEquipment.delete({ where: { id } });
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return false;
  }
}

export async function addShot(shootId: string, title: string, description: string, order: number) {
  try {
    const shot = await prisma.shootShot.create({
      data: { shootId, title, description, order }
    });
    revalidatePath(`/shoots/${shootId}`);
    return { success: true, shot };
  } catch (error) {
    console.error("Error adding shot:", error);
    return { success: false, error: "Failed to add shot" };
  }
}

export async function toggleShot(id: string, isCompleted: boolean, shootId: string) {
  try {
    await prisma.shootShot.update({
      where: { id },
      data: { isCompleted }
    });
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error toggling shot:", error);
    return false;
  }
}

export async function deleteShot(id: string, shootId: string) {
  try {
    await prisma.shootShot.delete({ where: { id } });
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error deleting shot:", error);
    return false;
  }
}

export async function reorderShots(shootId: string, orderedIds: string[]) {
  try {
    // Perform bulk updates in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.shootShot.update({
          where: { id },
          data: { order: index }
        })
      )
    );
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error reordering shots:", error);
    return false;
  }
}

export type ShootWithRelations = NonNullable<Awaited<ReturnType<typeof getShoot>>>;
export type ShootListWithRelations = Awaited<ReturnType<typeof getShoots>>["shoots"][number];
