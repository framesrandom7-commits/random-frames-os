import { WorkflowEvent } from "../events";
import { EventBus } from "../event-bus";
import { logActivity } from "@/lib/timeline";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export function registerTimelineHandlers() {
  EventBus.subscribe(WorkflowEvent.PROJECT_CREATED, 'Timeline_ProjectCreated', async (payload) => {
    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });
    if (!project) return;
    await logActivity({
      type: "SYSTEM",
      description: `Project '${project.title}' was created`,
      projectId: payload.projectId,
      clientId: payload.clientId,
      metadata: payload
    });
  });

  EventBus.subscribe(WorkflowEvent.CLIENT_CREATED, 'Timeline_ClientCreated', async (payload) => {
    const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
    if (!client) return;
    await logActivity({
      type: "SYSTEM",
      description: `Client '${client.businessName}' was onboarded`,
      clientId: payload.clientId,
      metadata: payload
    });
  });

  EventBus.subscribe(WorkflowEvent.SHOOT_SCHEDULED, 'Timeline_ShootScheduled', async (payload) => {
    const shoot = await prisma.shoot.findUnique({ where: { id: payload.shootId } });
    if (!shoot) return;
    await logActivity({
      type: "SYSTEM",
      description: `Shoot '${shoot.title}' was scheduled`,
      shootId: payload.shootId,
      projectId: payload.projectId,
      metadata: payload
    });
  });

  EventBus.subscribe(WorkflowEvent.FOLDER_CREATED, 'Timeline_FolderCreated', async (payload) => {
    await logActivity({
      type: "SYSTEM",
      description: `Google Drive folder was created automatically`,
      projectId: payload.entityType === 'Project' ? payload.entityId : undefined,
      clientId: payload.entityType === 'Client' ? payload.entityId : undefined,
      shootId: payload.entityType === 'Shoot' ? payload.entityId : undefined,
      metadata: payload
    });
  });
}
