import { prisma } from "@/lib/prisma";
import { encryptToken, decryptToken } from "@/lib/crypto";
import { IntegrationSettings } from "@prisma/client";
import { Logger } from "@/lib/logger";

export class CredentialManager {
  static async getCredentials(provider: string): Promise<IntegrationSettings | null> {
    try {
      const settings = await prisma.integrationSettings.findUnique({
        where: { provider }
      });
      return settings;
    } catch (error) {
      Logger.error(`Failed to get credentials for ${provider}`, error);
      return null;
    }
  }

  static async hasCredentials(provider: string): Promise<boolean> {
    const settings = await this.getCredentials(provider);
    return !!settings && !!settings.accessToken;
  }

  static async updateCredentials(
    provider: string,
    accessToken: string,
    refreshToken?: string | null,
    expiryDate?: Date | null,
    userId?: string
  ): Promise<void> {
    try {
      const data: any = { accessToken };
      if (refreshToken) data.refreshToken = encryptToken(refreshToken);
      if (expiryDate) data.tokenExpiry = expiryDate;
      if (userId) data.userId = userId;
      data.syncStatus = 'CONNECTED';

      await prisma.integrationSettings.upsert({
        where: { provider },
        update: data,
        create: {
          provider,
          ...data
        }
      });
    } catch (error) {
      Logger.error(`Failed to update credentials for ${provider}`, error);
      throw error;
    }
  }

  static decrypt(token: string): string {
    return decryptToken(token);
  }

  static encrypt(token: string): string {
    return encryptToken(token);
  }
}
