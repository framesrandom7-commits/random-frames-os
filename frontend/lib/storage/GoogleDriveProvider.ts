import { google, drive_v3 } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { decryptToken } from '@/lib/crypto';
import { StorageProvider, StorageFolder } from './StorageProvider';
import { validateStorageEnvironment, getRequiredEnv } from '@/lib/env';
import { Logger } from '@/lib/logger';
import { withRetry } from '@/lib/utils/retry';

export class GoogleDriveProvider implements StorageProvider {
  private drive: drive_v3.Drive | null = null;
  private userId: string;
  private MODULE_NAME = 'GoogleDriveProvider';

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    const startTime = Date.now();
    try {
      validateStorageEnvironment();

      const settings = await prisma.integrationSettings.findFirst({
        where: { provider: 'GOOGLE_DRIVE', userId: this.userId }
      });

      if (!settings || !settings.refreshToken) {
        throw new Error('Google Drive integration not configured or missing refresh token.');
      }

      const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
      const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
      const redirectUri = getRequiredEnv('GOOGLE_REDIRECT_URI');

      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );

      const decryptedRefreshToken = decryptToken(settings.refreshToken);
      oauth2Client.setCredentials({
        refresh_token: decryptedRefreshToken,
      });

      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      
      // Attempt a lightweight call to verify the token is still valid
      await this.getStorageUsageBytes();
      
      // If we reach here, it's valid
      await prisma.integrationSettings.updateMany({
        where: { provider: 'GOOGLE_DRIVE', userId: this.userId },
        data: { syncStatus: 'CONNECTED' }
      });
      
      Logger.info('Initialized GoogleDriveProvider successfully', {
        module: this.MODULE_NAME,
        operation: 'initialize',
        status: 'SUCCESS',
        durationMs: Date.now() - startTime
      });
    } catch (error: any) {
      // Detect Revoked Authorization (invalid_grant)
      if (error?.message?.includes('invalid_grant') || error?.response?.data?.error === 'invalid_grant') {
        Logger.error('Google authorization revoked by user', error, {
          module: this.MODULE_NAME,
          operation: 'initialize',
          status: 'ERROR',
        });
        
        await prisma.integrationSettings.updateMany({
          where: { provider: 'GOOGLE_DRIVE', userId: this.userId },
          data: { syncStatus: 'ERROR', refreshToken: null } // Clear invalid token
        });
      }
      throw error;
    }
  }

  private ensureInitialized() {
    if (!this.drive) {
      throw new Error('GoogleDriveProvider must be initialized before use.');
    }
  }

  async createFolder(name: string, parentFolderId?: string): Promise<StorageFolder> {
    this.ensureInitialized();
    const startTime = Date.now();
    
    return withRetry(async () => {
      const fileMetadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : [],
      };
      
      const response = await this.drive!.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink',
      });
      
      Logger.info(`Created folder ${name}`, {
        module: this.MODULE_NAME,
        operation: 'createFolder',
        status: 'SUCCESS',
        folderId: response.data.id,
        durationMs: Date.now() - startTime
      });
      
      return {
        id: response.data.id!,
        name: response.data.name!,
        url: response.data.webViewLink!,
      };
    }, { module: this.MODULE_NAME, operation: 'createFolder' });
  }

  async getFolder(folderId: string): Promise<StorageFolder> {
    this.ensureInitialized();
    
    return withRetry(async () => {
      const response = await this.drive!.files.get({
        fileId: folderId,
        fields: 'id, name, webViewLink',
      });
      
      return {
        id: response.data.id!,
        name: response.data.name!,
        url: response.data.webViewLink!,
      };
    }, { module: this.MODULE_NAME, operation: 'getFolder' });
  }

  async deleteItem(itemId: string): Promise<void> {
    this.ensureInitialized();
    
    return withRetry(async () => {
      await this.drive!.files.delete({ fileId: itemId });
      Logger.info(`Deleted item ${itemId}`, {
        module: this.MODULE_NAME,
        operation: 'deleteItem',
        status: 'SUCCESS'
      });
    }, { module: this.MODULE_NAME, operation: 'deleteItem' });
  }

  async getStorageUsageBytes(): Promise<{ usage: number, limit: number }> {
    this.ensureInitialized();
    
    return withRetry(async () => {
      const response = await this.drive!.about.get({
        fields: 'storageQuota',
      });
      
      const usage = response.data.storageQuota?.usage;
      const limit = response.data.storageQuota?.limit;
      return {
        usage: usage ? parseInt(usage, 10) : 0,
        limit: limit ? parseInt(limit, 10) : 15 * 1024 * 1024 * 1024, // Default to 15GB if unknown
      };
    }, { module: this.MODULE_NAME, operation: 'getStorageUsageBytes' });
  }

  async listContents(folderId: string): Promise<any[]> {
    this.ensureInitialized();
    
    return withRetry(async () => {
      const response = await this.drive!.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime, modifiedTime)',
        orderBy: 'folder, name',
        pageSize: 1000,
      });
      
      return response.data.files || [];
    }, { module: this.MODULE_NAME, operation: 'listContents' });
  }
}
