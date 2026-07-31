import { prisma } from "./prisma";
import { getDriveService } from "./google";
import { QueueService } from "./queue.service";
import { Logger } from "./logger";

export class DriveService {
  /**
   * Fail-safe execution of folder creation to prevent blocking CRM
   */
  private static async safeCreateFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      const drive = await getDriveService();
      const fileMetadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
      };
      
      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id || null;
    } catch (error: any) {
      Logger.error(`[DriveService] Failed to create folder ${name}`, error);
      throw error;
    }
  }

  static async createClientFolders(clientId: string, clientName: string): Promise<boolean> {
    try {
      const driveSettings = await prisma.integrationSettings.findUnique({
        where: { provider: "GOOGLE_DRIVE" }
      });

      if (!driveSettings || !driveSettings.accessToken) {
        Logger.warn("[DriveService] Drive not connected.");
        return false;
      }

      const rootFolderId = driveSettings.rootFolderId || 'root'; // Fallback to drive root if setting is missing

      // Create main Client Folder
      const clientFolderId = await this.safeCreateFolder(clientName, rootFolderId);
      if (!clientFolderId) throw new Error('Drive returned null ID');

      // Update Client immediately
      const driveFolderUrl = `https://drive.google.com/drive/folders/${clientFolderId}`;
      await prisma.client.update({
        where: { id: clientId },
        data: { driveFolderId: clientFolderId, driveFolderUrl }
      });

      // Create Subfolders asynchronously (best effort, or we queue failures)
      try {
        await Promise.all([
          this.safeCreateFolder("Documents", clientFolderId),
          this.safeCreateFolder("Projects", clientFolderId)
        ]);
      } catch (subError: any) {
        // If subfolders fail, queue them for retry
        await QueueService.pushJob("GOOGLE_DRIVE", "CREATE_SUBFOLDERS", { clientId, clientName, clientFolderId }, subError.message);
      }

      return true;
    } catch (error: any) {
      Logger.error("[DriveService] Client folder creation failed.", error);
      await QueueService.pushJob("GOOGLE_DRIVE", "CREATE_CLIENT_FOLDERS", { clientId, clientName }, error.message);
      return false; // Fail-safe
    }
  }

  static async createProjectFolders(projectId: string, projectName: string, clientFolderId: string | null): Promise<boolean> {
    try {
      if (!clientFolderId) {
        Logger.warn("[DriveService] Client folder ID is null. Cannot nest project folder.");
        return false;
      }

      // We should ideally find the "Projects" subfolder of the client, but for simplicity, we put it under Client
      const projectRootId = await this.safeCreateFolder(projectName, clientFolderId);
      if (!projectRootId) throw new Error('Drive returned null ID for project');

      const projectRootUrl = `https://drive.google.com/drive/folders/${projectRootId}`;

      // Create standard structure
      const subfolders = ["RAW", "Photos", "Reels", "Brand Films", "Final Delivery", "Archive"];
      const folderIds: Record<string, string> = {};

      for (const sub of subfolders) {
        const id = await this.safeCreateFolder(sub, projectRootId);
        if (id) folderIds[sub] = id;
      }
      
      await prisma.project.update({
        where: { id: projectId },
        data: {
          driveRootFolderId: projectRootId,
          driveRootFolderUrl: projectRootUrl,
          rawFolderId: folderIds["RAW"],
          editFolderId: folderIds["Photos"],
          socialFolderId: folderIds["Reels"],
          deliveryFolderId: folderIds["Final Delivery"],
          backupFolderId: folderIds["Archive"]
        }
      });

      return true;
    } catch (error: any) {
      Logger.error("[DriveService] Project folder creation failed.", error);
      await QueueService.pushJob("GOOGLE_DRIVE", "CREATE_PROJECT_FOLDERS", { projectId, projectName, clientFolderId }, error.message);
      return false;
    }
  }
}
