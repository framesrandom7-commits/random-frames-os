import { WorkflowEvent } from "../events";
import { EventBus } from "../event-bus";
import { JobQueue } from "@/lib/jobs/JobQueue";
import { NotificationCenter } from "@/lib/core/notifications/notification-center";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export function registerStorageHandlers() {
  
  // 1. CLIENT CREATED
  EventBus.subscribe(WorkflowEvent.CLIENT_CREATED, 'Storage_ClientCreated', async (payload) => {
    if (!payload.userId) return; // Need a user to sync Drive properly
    
    const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
    if (!client) throw new Error("Client not found for automation");

    await JobQueue.enqueue('CREATE_CLIENT_FOLDERS', {
      clientId: client.id,
      clientName: client.businessName,
      userId: payload.userId
    });
  });

  // 2. PROJECT CREATED
  EventBus.subscribe(WorkflowEvent.PROJECT_CREATED, 'Storage_ProjectCreated', async (payload) => {
    if (!payload.userId) return;

    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
      include: { client: true }
    });

    if (!project) throw new Error("Project not found for automation");
    if (!project.client.driveFolderId) {
      Logger.warn(`[StorageHandler] Cannot create project folders for ${project.id}. Client is missing driveFolderId.`);
      return;
    }

    await JobQueue.enqueue('CREATE_PROJECT_FOLDERS', {
      projectId: project.id,
      projectName: project.title,
      clientName: project.client.businessName,
      clientDriveFolderId: project.client.driveFolderId,
      userId: payload.userId
    });

    await NotificationCenter.dispatch({
      title: "Storage Setup Queued",
      message: `Setting up Google Drive folders for project '${project.title}'...`,
      type: 'STORAGE',
      projectId: project.id,
      userId: payload.userId
    });
  });

  // 3. SHOOT SCHEDULED
  EventBus.subscribe(WorkflowEvent.SHOOT_SCHEDULED, 'Storage_ShootScheduled', async (payload) => {
    if (!payload.userId) return;

    const shoot = await prisma.shoot.findUnique({
      where: { id: payload.shootId },
    });
    
    const project = await prisma.project.findUnique({
      where: { id: payload.projectId }
    });

    if (!shoot || !project) throw new Error("Shoot or Project not found for automation");
    if (!project.driveRootFolderId) {
      Logger.warn(`[StorageHandler] Cannot create shoot folders for ${shoot.id}. Project is missing driveRootFolderId.`);
      return;
    }

    await JobQueue.enqueue('CREATE_SHOOT_FOLDERS', {
      shootId: shoot.id,
      shootName: shoot.title,
      projectDriveRootFolderId: project.driveRootFolderId,
      userId: payload.userId
    });
  });

  // 4. GENERIC FOLDER CREATED NOTIFICATION
  EventBus.subscribe(WorkflowEvent.FOLDER_CREATED, 'Storage_FolderCreated', async (payload) => {
    if (payload.userId && payload.entityType === 'Project') {
      await NotificationCenter.dispatch({
        title: "Storage Setup Complete",
        message: `Google Drive storage is ready.`,
        type: 'SUCCESS',
        actionUrl: payload.folderUrl,
        userId: payload.userId,
      });
    }
  });
}
