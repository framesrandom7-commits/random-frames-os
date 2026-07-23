"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DeliverableStatus } from "@prisma/client";

export type CreateDeliverableData = {
  shootId: string;
  type: string;
  assignedEditor?: string | null;
  status?: DeliverableStatus;
  dueDate?: Date | null;
  completionDate?: Date | null;
  clientApproval?: boolean;
  downloadLink?: string | null;
};

export async function createDeliverable(data: CreateDeliverableData) {
  try {
    const deliverable = await prisma.deliverable.create({
      data: {
        shootId: data.shootId,
        type: data.type,
        assignedEditor: data.assignedEditor,
        status: data.status || "PENDING",
        dueDate: data.dueDate,
        completionDate: data.completionDate,
        clientApproval: data.clientApproval || false,
        downloadLink: data.downloadLink,
        version: 1,
      }
    });

    const shoot = await prisma.shoot.findUnique({
      where: { id: data.shootId },
      select: { projectId: true, clientId: true }
    });

    if (shoot) {
      const { logActivity } = await import("@/lib/timeline");
      await logActivity({
        type: "SYSTEM",
        description: `Deliverable added: ${data.type}`,
        clientId: shoot.clientId,
        projectId: shoot.projectId,
        shootId: data.shootId,
      });
    }

    revalidatePath(`/shoots/${data.shootId}`);
    return { success: true, deliverable };
  } catch (error) {
    console.error("Error creating deliverable:", error);
    return { success: false, error: "Failed to create deliverable" };
  }
}

export async function updateDeliverable(id: string, data: Partial<CreateDeliverableData> & { version?: number }) {
  try {
    const deliverable = await prisma.deliverable.update({
      where: { id },
      data
    });

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true, deliverable };
  } catch (error) {
    console.error("Error updating deliverable:", error);
    return { success: false, error: "Failed to update deliverable" };
  }
}

export async function incrementDeliverableVersion(id: string) {
  try {
    const deliverable = await prisma.deliverable.update({
      where: { id },
      data: { version: { increment: 1 } }
    });

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true, deliverable };
  } catch (error) {
    console.error("Error incrementing deliverable version:", error);
    return { success: false, error: "Failed to increment version" };
  }
}

export async function deleteDeliverable(id: string) {
  try {
    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) return { success: false, error: "Deliverable not found" };

    await prisma.deliverable.delete({
      where: { id }
    });

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting deliverable:", error);
    return { success: false, error: "Failed to delete deliverable" };
  }
}

export async function getDeliverablesByShoot(shootId: string) {
  try {
    return await prisma.deliverable.findMany({
      where: { shootId },
      orderBy: { createdAt: "asc" }
    });
  } catch (error) {
    console.error("Error fetching deliverables:", error);
    return [];
  }
}
