import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export async function auditLogEvent(action: string, payload: any, userId?: string) {
  try {
    // Basic extraction
    const entityId = payload?.projectId || payload?.clientId || payload?.leadId || payload?.shootId || payload?.invoiceId || payload?.fileId || payload?.folderId;
    const entityType = payload?.projectId ? 'Project' : 
                       payload?.clientId ? 'Client' : 
                       payload?.leadId ? 'Lead' : 
                       payload?.shootId ? 'Shoot' :
                       payload?.invoiceId ? 'Invoice' :
                       payload?.fileId ? 'File' : 'System';

    await prisma.auditLog.create({
      data: {
        action,
        module: 'WorkflowEngine',
        entityId: typeof entityId === 'string' ? entityId : undefined,
        entityType,
        userId: userId || undefined,
        metadata: payload,
      }
    });
  } catch (error) {
    Logger.error(`[AuditLogger] Failed to write audit log for action: ${action}`, error);
  }
}
