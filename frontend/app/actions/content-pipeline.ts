"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ContentFormat, ContentPipelineStatus } from "@prisma/client";

export async function getClientContentDeliverables(clientId: string) {
  try {
    const deliverables = await prisma.clientContentDeliverable.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });
    return deliverables;
  } catch (error) {
    console.error("[GET_CONTENT_DELIVERABLES_ERROR]", error);
    return [];
  }
}

export async function createContentDeliverable(data: {
  clientId: string;
  title: string;
  format: ContentFormat;
  driveLink?: string;
}) {
  try {
    const deliverable = await prisma.clientContentDeliverable.create({
      data: {
        ...data,
        status: "EDITING", // Default status
      }
    });
    revalidatePath(`/clients/${data.clientId}/workspace`);
    return { success: true, deliverable };
  } catch (error) {
    console.error("[CREATE_CONTENT_DELIVERABLE_ERROR]", error);
    return { success: false, error: "Failed to create deliverable" };
  }
}

export async function updateContentDeliverableStatus(id: string, clientId: string, status: ContentPipelineStatus) {
  try {
    const deliverable = await prisma.clientContentDeliverable.update({
      where: { id },
      data: { status }
    });
    revalidatePath(`/clients/${clientId}/workspace`);
    return { success: true, deliverable };
  } catch (error) {
    console.error("[UPDATE_CONTENT_DELIVERABLE_STATUS_ERROR]", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteContentDeliverable(id: string, clientId: string) {
  try {
    await prisma.clientContentDeliverable.delete({
      where: { id }
    });
    revalidatePath(`/clients/${clientId}/workspace`);
    return { success: true };
  } catch (error) {
    console.error("[DELETE_CONTENT_DELIVERABLE_ERROR]", error);
    return { success: false, error: "Failed to delete deliverable" };
  }
}
