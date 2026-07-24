"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { 
  createDeliverableSchema, 
  updateDeliverableSchema, 
  addDeliverableFileSchema, 
  addDeliverableVersionSchema 
} from "@/lib/validations/deliverable";
import { z } from "zod";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export async function createDeliverable(data: z.infer<typeof createDeliverableSchema>) {
  try {
    const validatedData = createDeliverableSchema.parse(data);
    
    const deliverable = await prisma.deliverable.create({
      data: {
        shootId: validatedData.shootId,
        type: validatedData.type,
        assignedEditor: validatedData.assignedEditor,
        status: validatedData.status || "PENDING",
        priority: validatedData.priority || "MEDIUM",
        dueDate: validatedData.dueDate,
        // Automatically create initial version 1
        versions: {
          create: {
            versionNumber: 1,
            changeNotes: "Initial version",
            createdBy: "System"
          }
        }
      },
      include: {
        shoot: { select: { projectId: true, clientId: true } }
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
    const oldDeliverable = await prisma.deliverable.findUnique({
      where: { id },
      include: { shoot: { select: { projectId: true, clientId: true } } }
    });
    
    if (!oldDeliverable) return { success: false, error: "Not found" };

    const deliverable = await prisma.deliverable.update({
      where: { id },
      data: validatedData,
      include: { shoot: { select: { projectId: true, clientId: true } } }
    });

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
    
    const file = await prisma.deliverableFile.create({
      data: validatedData,
      include: {
        deliverable: { include: { shoot: true } }
      }
    });

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
    
    // Get highest version number
    const lastVersion = await prisma.deliverableVersion.findFirst({
      where: { deliverableId: validatedData.deliverableId },
      orderBy: { versionNumber: 'desc' }
    });
    
    const nextVersionNum = (lastVersion?.versionNumber || 0) + 1;

    const version = await prisma.deliverableVersion.create({
      data: {
        deliverableId: validatedData.deliverableId,
        versionNumber: nextVersionNum,
        changeNotes: validatedData.changeNotes,
        createdBy: "User" // Typically you'd pull from auth session
      },
      include: {
        deliverable: { include: { shoot: true } }
      }
    });

    const { logActivity } = await import("@/lib/timeline");
    await logActivity({
      type: "SYSTEM",
      description: `New version (v${nextVersionNum}) uploaded for deliverable ${version.deliverable.type}`,
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
    const deliverable = await prisma.deliverable.findUnique({ where: { id } });
    if (!deliverable) return { success: false, error: "Deliverable not found" };

    await prisma.deliverable.delete({
      where: { id }
    });

    revalidatePath(`/shoots/${deliverable.shootId}`);
    return { success: true };
  } catch (error) {
  console.error("Error in deleteDeliverable:", error);
  return GlobalErrorService.handleError(error, "Action:deleteDeliverable");
}
}
export async function deleteDeliverableFile(fileId: string) {
  try {
    const file = await prisma.deliverableFile.findUnique({ 
      where: { id: fileId },
      include: { deliverable: true }
    });
    if (!file) return { success: false, error: "File not found" };

    await prisma.deliverableFile.delete({ where: { id: fileId } });

    revalidatePath(`/shoots/${file.deliverable.shootId}`);
    return { success: true };
  } catch (error) {
  console.error("Error in deleteDeliverableFile:", error);
  return GlobalErrorService.handleError(error, "Action:deleteDeliverableFile");
}
}

export async function getDeliverablesByShoot(shootId: string) {
  try {
    return await prisma.deliverable.findMany({
      where: { shootId },
      include: {
        files: { orderBy: { uploadedAt: "desc" } },
        versions: { orderBy: { versionNumber: "desc" } }
      },
      orderBy: { createdAt: "asc" }
    });
  } catch (error) {
  console.error("Error in getDeliverablesByShoot:", error);
  return GlobalErrorService.handleError(error, "Action:getDeliverablesByShoot");
}
}

export async function getPendingDeliverables() {
  try {
    return await prisma.deliverable.findMany({
      where: {
        status: { in: ["PENDING", "EDITING", "CHANGES_REQUESTED"] }
      },
      include: {
        shoot: {
          include: { project: true }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }, // Assuming HIGH sorts before LOW if enum is string, wait Prisma string enums sort alphabetically if not careful? Actually, let's just order by dueDate
      ],
      take: 5
    });
  } catch (error) {
  console.error("Error in getPendingDeliverables:", error);
  return GlobalErrorService.handleError(error, "Action:getPendingDeliverables");
}
}
