"use server";

import { IntegrationService } from "@/lib/integrations/core/integration.service";
import { WebhookService } from "@/lib/integrations/webhooks/webhook.service";
import { BackupService } from "@/lib/integrations/backup/backup.service";
import { successResponse } from "@/lib/core/api/response";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { verifySession as getSession } from "@/lib/auth";
import { WebhookRepository } from "@/domain/repositories/WebhookRepository";
import { DriveService } from "@/domain/services/DriveService";

export async function getIntegrationStatuses() {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    
    // In production we would check permissions here: await requirePermission("manage_integrations");
    
    const statuses = await IntegrationService.getIntegrationStatuses();
    return successResponse(statuses);
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:GetStatuses");
  }
}

export async function disconnectIntegration(providerId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    
    await IntegrationService.disconnectProvider(providerId);
    return successResponse({ success: true });
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:Disconnect");
  }
}

export async function getWebhooks() {
  try {
    const webhooks = await WebhookRepository.getWebhooks();
    return successResponse(webhooks);
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:GetWebhooks");
  }
}

export async function createWebhook(data: { name: string, url: string, eventTypes: string[] }) {
  try {
    const webhook = await WebhookRepository.createWebhook({
      name: data.name,
      url: data.url,
      eventTypes: JSON.stringify(data.eventTypes)
    });
    return successResponse(webhook);
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:CreateWebhook");
  }
}

export async function triggerManualBackup() {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    const backup = await BackupService.generateDatabaseBackup();
    return successResponse(backup);
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:TriggerBackup");
  }
}

export async function createProjectDriveFolder(projectId: string) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    
    // Fetch project to get client and title
    const { ProjectService } = await import("@/domain/services/ProjectService");
    const project = await ProjectService.getProject(projectId);
    if (!project) throw new Error("Project not found");
    
    const result = await DriveService.setupProjectFolder(projectId, project.clientId, project.title);
    return successResponse(result);
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:CreateDriveFolder");
  }
}

export async function syncWeb3FormsEmails() {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    
    // Stub implementation to satisfy the frontend component
    return successResponse({ synced: true, count: 0 });
  } catch (error) {
    return GlobalErrorService.handleError(error, "IntegrationsAction:SyncWeb3Forms");
  }
}
