"use server";

import { revalidatePath } from "next/cache";
import { ShootType, ShootStatus } from "@prisma/client";
import { ShootService } from "@/domain/services/ShootService";
import { GetShootsParams } from "@/domain/repositories/ShootRepository";
import { checkFounderRbac } from "./rbac";

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

export async function generateShootCode(): Promise<string> {
  return ShootService.generateCode();
}

export async function createShoot(data: CreateShootData) {
  try {
    await checkFounderRbac();
    const shoot = await ShootService.create(data);
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
    await checkFounderRbac();
    const shoot = await ShootService.update(id, data);
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
    const shoot = await ShootService.softDelete(id);
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
    const newShoot = await ShootService.duplicate(id);
    revalidatePath("/shoots");
    revalidatePath(`/projects/${newShoot.projectId}`);
    revalidatePath(`/clients/${newShoot.clientId}`);
    revalidatePath("/calendar");
    return { success: true, shoot: newShoot };
  } catch (error: any) {
    console.error("Error duplicating shoot:", error);
    return { success: false, error: error.message || "Failed to duplicate shoot" };
  }
}

export async function getShoot(id: string) {
  try {
    return await ShootService.getById(id);
  } catch (error) {
    console.error("Error fetching shoot:", error);
    return null;
  }
}

export async function getShoots(params: GetShootsParams = {}) {
  try {
    return await ShootService.getMany(params);
  } catch (error) {
    console.error("Error fetching shoots:", error);
    return { shoots: [], total: 0, totalPages: 0, currentPage: params.page || 1 };
  }
}

export async function getShootStats() {
  try {
    return await ShootService.getStats();
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
    const equip = await ShootService.addEquipment(shootId, name);
    revalidatePath(`/shoots/${shootId}`);
    return { success: true, equipment: equip };
  } catch (error) {
    console.error("Error adding equipment:", error);
    return { success: false, error: "Failed to add equipment" };
  }
}

export async function toggleEquipment(id: string, isCompleted: boolean, shootId: string) {
  try {
    await ShootService.toggleEquipment(id, isCompleted);
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error toggling equipment:", error);
    return false;
  }
}

export async function deleteEquipment(id: string, shootId: string) {
  try {
    await ShootService.deleteEquipment(id);
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return false;
  }
}

export async function addShot(shootId: string, title: string, description: string, order: number) {
  try {
    const shot = await ShootService.addShot(shootId, title, description, order);
    revalidatePath(`/shoots/${shootId}`);
    return { success: true, shot };
  } catch (error) {
    console.error("Error adding shot:", error);
    return { success: false, error: "Failed to add shot" };
  }
}

export async function toggleShot(id: string, isCompleted: boolean, shootId: string) {
  try {
    await ShootService.toggleShot(id, isCompleted);
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error toggling shot:", error);
    return false;
  }
}

export async function deleteShot(id: string, shootId: string) {
  try {
    await ShootService.deleteShot(id);
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error deleting shot:", error);
    return false;
  }
}

export async function reorderShots(shootId: string, orderedIds: string[]) {
  try {
    await ShootService.reorderShots(orderedIds);
    revalidatePath(`/shoots/${shootId}`);
    return true;
  } catch (error) {
    console.error("Error reordering shots:", error);
    return false;
  }
}

export type ShootWithRelations = NonNullable<Awaited<ReturnType<typeof getShoot>>>;
export type ShootListWithRelations = Awaited<ReturnType<typeof getShoots>>["shoots"][number];
