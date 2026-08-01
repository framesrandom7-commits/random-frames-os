import { CredentialManager } from "./credential-manager";
import { Logger } from "@/lib/logger";

export class ConnectionManager {
  static async isConnected(provider: string): Promise<boolean> {
    const creds = await CredentialManager.getCredentials(provider);
    return !!(creds && creds.accessToken && creds.syncStatus === 'CONNECTED');
  }

  static async disconnect(provider: string): Promise<void> {
    const { prisma } = await import("@/lib/prisma");
    try {
      await prisma.integrationSettings.update({
        where: { provider },
        data: {
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          syncStatus: 'DISCONNECTED',
        }
      });
    } catch (error) {
      Logger.error(`Failed to disconnect ${provider}`, error);
    }
  }
}
