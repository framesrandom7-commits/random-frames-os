"use server";

import { verifySession as getSession } from '@/lib/auth';
import { StorageService, StorageFile } from "@/lib/storage/StorageService";
import { Logger } from "@/lib/logger";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

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
  console.error("Error in getDriveFolderContents:", error);
  return GlobalErrorService.handleError(error, "Action:getDriveFolderContents");
}
}
