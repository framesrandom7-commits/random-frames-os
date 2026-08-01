import { prisma } from "@/lib/prisma";

export class HealthManager {
  static async updateHealthStatus(provider: string, status: string, error?: string) {
    try {
      await prisma.integrationSettings.update({
        where: { provider },
        data: {
          syncStatus: status,
          lastSyncAt: new Date(),
          metadata: error ? { lastError: error } : undefined
        }
      });
    } catch (e) {
      console.error(`HealthManager failed to update ${provider} status`, e);
    }
  }
}
