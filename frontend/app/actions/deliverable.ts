"use server";

import { revalidatePath } from "next/cache";
import { 
  createDeliverableSchema, 
  updateDeliverableSchema, 
  addDeliverableFileSchema, 
  addDeliverableVersionSchema 
} from "@/lib/validations/deliverable";
import { z } from "zod";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { DeliverableService } from "@/domain/services/DeliverableService";

export async function createDeliverable(data: z.infer<typeof createDeliverableSchema>) {
  try {
    const validatedData = createDeliverableSchema.parse(data);
    
    const deliverable = await DeliverableService.createDeliverable({
      shootId: validatedData.shootId,
      type: validatedData.type,
      assignedEditor: validatedData.assignedEditor,
      status: validatedData.status || "PENDING",
      priority: validatedData.priority || "MEDIUM",
      dueDate: validatedData.dueDate,
      versions: {
        create: {
          versionNumber: 1,
          changeNotes: "Initial version",
          createdBy: "System"
        }
      }
    });

    if (deliverable.shoot) {
      const { logActivity } = await import("@/lib/timeline");
      await logActivity({
        type: "SYSTEM",
        description: `Deliverable added: ${deliverable.type}`,
        clientId: deliverable.shoot.clientId,
        projectId: deliverable.shoot.projectId,
        shootId: deliverable.shootId,
      });
      
      if (deliverable.assignedEditor) {
         await logActivity({
          type: "SYSTEM",
          description: `Editor assigned to ${deliverable.type}: ${deliverable.assignedEditor}`,
          clientId: deliverable.shoot.clientId,
          projectId: deliverable.shoot.projectId,
          shootId: deliverable.shootId,
        });
      }
    }

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true, deliverable };
  } catch (error) {
  console.error("Error in createDeliverable:", error);
  return GlobalErrorService.handleError(error, "Action:createDeliverable");
}
}

export async function updateDeliverable(id: string, data: z.infer<typeof updateDeliverableSchema>) {
  try {
    const validatedData = updateDeliverableSchema.parse(data);
    
    // Fetch old to compare status
    const oldDeliverable = await DeliverableService.getById(id);
    
    if (!oldDeliverable) return { success: false, error: "Not found" };

    const deliverable = await DeliverableService.updateDeliverable(id, validatedData);

    // Logging status changes
    if (deliverable.shoot && oldDeliverable.status !== deliverable.status) {
      const { logActivity } = await import("@/lib/timeline");
      await logActivity({
        type: "STATUS_CHANGE",
        description: `Deliverable status updated to ${deliverable.status.replace(/_/g, " ")}: ${deliverable.type}`,
        clientId: deliverable.shoot.clientId,
        projectId: deliverable.shoot.projectId,
        shootId: deliverable.shootId,
      });
    }

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true, deliverable };
  } catch (error) {
  console.error("Error in updateDeliverable:", error);
  return GlobalErrorService.handleError(error, "Action:updateDeliverable");
}
}

export async function addDeliverableFile(data: z.infer<typeof addDeliverableFileSchema>) {
  try {
    const validatedData = addDeliverableFileSchema.parse(data);
    const file = await DeliverableService.addFile(validatedData);

    const { logActivity } = await import("@/lib/timeline");
    await logActivity({
      type: "FILE_UPLOAD",
      description: `File added to deliverable ${file.deliverable.type}: ${file.name}`,
      clientId: file.deliverable.shoot.clientId,
      projectId: file.deliverable.shoot.projectId,
      shootId: file.deliverable.shootId,
    });

    revalidatePath(`/shoots/${file.deliverable.shootId}`);
    return { success: true, file };
  } catch (error) {
  console.error("Error in addDeliverableFile:", error);
  return GlobalErrorService.handleError(error, "Action:addDeliverableFile");
}
}

export async function addDeliverableVersion(data: z.infer<typeof addDeliverableVersionSchema>) {
  try {
    const validatedData = addDeliverableVersionSchema.parse(data);
    
    const version = await DeliverableService.addVersion({
      deliverableId: validatedData.deliverableId,
      changeNotes: validatedData.changeNotes,
      createdBy: "User" // Typically you'd pull from auth session
    });

    const { logActivity } = await import("@/lib/timeline");
    await logActivity({
      type: "SYSTEM",
      description: `New version (v${version.versionNumber}) uploaded for deliverable ${version.deliverable.type}`,
      clientId: version.deliverable.shoot.clientId,
      projectId: version.deliverable.shoot.projectId,
      shootId: version.deliverable.shootId,
    });

    revalidatePath(`/shoots/${version.deliverable.shootId}`);
    return { success: true, version };
  } catch (error) {
  console.error("Error in addDeliverableVersion:", error);
  return GlobalErrorService.handleError(error, "Action:addDeliverableVersion");
}
}

export async function deleteDeliverable(id: string) {
  try {
    const deliverable = await DeliverableService.getById(id);
    if (!deliverable) return { success: false, error: "Deliverable not found" };

    await DeliverableService.deleteDeliverable(id);

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true };
  } catch (error) {
  console.error("Error in deleteDeliverable:", error);
  return GlobalErrorService.handleError(error, "Action:deleteDeliverable");
}
}
export async function deleteDeliverableFile(fileId: string) {
  try {
    const file = await DeliverableService.getFileById(fileId);
    if (!file) return { success: false, error: "File not found" };

    await DeliverableService.deleteFile(fileId);

    revalidatePath(`/shoots/${file.deliverable.shootId}`);
    return { success: true };
  } catch (error) {
  console.error("Error in deleteDeliverableFile:", error);
  return GlobalErrorService.handleError(error, "Action:deleteDeliverableFile");
}
}

export async function getDeliverablesByShoot(shootId: string) {
  try {
    return await DeliverableService.getByShoot(shootId);
  } catch (error) {
  console.error("Error in getDeliverablesByShoot:", error);
  return GlobalErrorService.handleError(error, "Action:getDeliverablesByShoot");
}
}

export async function getPendingDeliverables() {
  try {
    return await DeliverableService.getPending();
  } catch (error) {
  console.error("Error in getPendingDeliverables:", error);
  return GlobalErrorService.handleError(error, "Action:getPendingDeliverables");
}
}
