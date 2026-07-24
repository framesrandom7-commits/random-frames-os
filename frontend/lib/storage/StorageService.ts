import { GoogleDriveProvider } from './GoogleDriveProvider';
import { StorageProvider, StorageFolder } from './StorageProvider';
import { Logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export interface StorageQuota {
  usedBytes: number;
  totalBytes: number;
  availableBytes: number;
}

export interface StorageFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes?: number;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export class StorageService {
  private provider: StorageProvider;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    // We currently strictly use Google Drive as per requirements.
    // If multiple providers were used, we would resolve them here based on settings.
    this.provider = new GoogleDriveProvider(userId);
  }

  /**
   * Initializes the underlying storage provider.
   * Throws an error if configuration or tokens are invalid.
   */
  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  /**
   * Creates a new folder.
   */
  async createFolder(name: string, parentFolderId?: string): Promise<StorageFolder> {
    await this.initialize();
    return this.provider.createFolder(name, parentFolderId);
  }

  /**
   * Retrieves a folder's metadata.
   */
  async getFolder(folderId: string): Promise<StorageFolder> {
    await this.initialize();
    return this.provider.getFolder(folderId);
  }

  /**
   * Retrieves storage usage from the provider.
   * Total bytes is hardcoded for demonstration or fetched from provider if supported.
   */
  async getStorageQuota(): Promise<StorageQuota> {
    await this.initialize();
    
    if (this.provider instanceof GoogleDriveProvider) {
      const quota = await (this.provider as GoogleDriveProvider).getStorageUsageBytes();
      return {
        usedBytes: quota.usage,
        totalBytes: quota.limit,
        availableBytes: Math.max(0, quota.limit - quota.usage),
      };
    }

    const usedBytes = await this.provider.getStorageUsageBytes();
    const totalBytes = 15 * 1024 * 1024 * 1024; // fallback
    return {
      usedBytes: usedBytes as any as number,
      totalBytes,
      availableBytes: Math.max(0, totalBytes - (usedBytes as any as number)),
    };
  }

  /**
   * Lists files and folders within a specific directory.
   */
  async listContents(folderId: string): Promise<StorageFile[]> {
    await this.initialize();
    
    // We must cast provider to GoogleDriveProvider to access specific list functionality,
    // or expand the StorageProvider interface.
    if (this.provider instanceof GoogleDriveProvider) {
      return (this.provider as any).listContents(folderId);
    }
    
    throw new Error('listContents is not implemented for this provider.');
  }

  /**
   * Fetches the overarching sync status of the integration.
   */
  async getSyncStatus(): Promise<string> {
    const settings = await prisma.integrationSettings.findFirst({
      where: { provider: 'GOOGLE_DRIVE', userId: this.userId }
    });
    return settings?.syncStatus || 'DISCONNECTED';
  }
}
