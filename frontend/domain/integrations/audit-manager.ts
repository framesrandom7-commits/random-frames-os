import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";
import { Logger } from "@/lib/logger";

export class AuditManager {
  static async logIntegrationEvent(
    provider: string,
    action: string,
    description: string,
    metadata?: any,
    relatedEntities?: { clientId?: string; projectId?: string }
  ) {
    try {
      await prisma.activity.create({
        data: {
          type: ActivityType.INTEGRATION_SYNC,
          description: `[${provider}] ${description}`,
          metadata: {
            action,
            provider,
            ...metadata
          },
          clientId: relatedEntities?.clientId,
          projectId: relatedEntities?.projectId,
        }
      });
    } catch (error) {
      Logger.error(`Failed to log integration event for ${provider}`, error);
    }
  }
}
