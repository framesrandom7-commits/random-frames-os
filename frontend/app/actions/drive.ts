"use server";

import { verifySession as getSession } from '@/lib/auth';
import { StorageService, StorageFile } from "@/lib/storage/StorageService";
import { Logger } from "@/lib/logger";

export async function getDriveFolderContents(folderId: string): Promise<{ success: boolean, files?: StorageFile[], error?: string }> {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const storage = new StorageService(session.userId);
    const files = await storage.listContents(folderId);

    return { success: true, files };
  } catch (error: any) {
    Logger.error('Failed to get drive folder contents', error, { module: 'DriveActions', operation: 'getDriveFolderContents', status: 'ERROR' });
    return { success: false, error: error.message };
  }
}
