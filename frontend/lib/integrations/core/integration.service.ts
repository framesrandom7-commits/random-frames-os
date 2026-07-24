import { prisma } from "@/lib/prisma";
import { IntegrationRegistry } from "./registry";
import { CryptoService } from "@/lib/core/security/crypto.service";
import "../init"; // Ensures providers are registered

export class IntegrationService {
  /**
   * Fetch all configured integrations from the database and sync them with the Registry.
   */
  public static async getIntegrationStatuses() {
    const dbSettings = await prisma.integrationSettings.findMany();
    const allProviders = IntegrationRegistry.getProviders();
    
    return allProviders.map((provider: any) => {
      const metadata = provider.getMetadata();
      const dbConfig = dbSettings.find(s => s.provider === metadata.id);
      
      return {
        ...metadata,
        isConfigured: !!dbConfig,
        lastSyncAt: dbConfig?.lastSyncAt || null,
        syncStatus: dbConfig?.syncStatus || "IDLE",
        storageUsageBytes: dbConfig?.storageUsageBytes || 0,
        fileCount: dbConfig?.fileCount || 0
      };
    });
  }

  /**
   * Save provider credentials securely.
   */
  public static async configureProvider(userId: string, providerId: string, accessToken: string, refreshToken?: string) {
    const encryptedAccess = CryptoService.encrypt(accessToken);
    const encryptedRefresh = refreshToken ? CryptoService.encrypt(refreshToken) : null;

    await prisma.integrationSettings.upsert({
      where: { provider: providerId },
      update: {
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        userId: userId,
        updatedAt: new Date()
      },
      create: {
        provider: providerId,
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        userId: userId,
        syncStatus: "IDLE"
      }
    });

    return true;
  }

  /**
   * Delete integration credentials.
   */
  public static async disconnectProvider(providerId: string) {
    await prisma.integrationSettings.delete({
      where: { provider: providerId }
    });
    return true;
  }
}
