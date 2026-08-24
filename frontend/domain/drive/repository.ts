import { prisma } from "@/lib/prisma";
import { getDriveService } from "@/lib/google";
import { DRIVE_CONSTANTS } from "./constants";
import { Logger } from "@/lib/logger";

export class DriveRepository {
  /**
   * Deterministically finds a folder by name and parent.
   */
  static async findFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      const drive = await getDriveService();
      const escapedName = name.replace(/'/g, "\\\\'");
      let query = `name='${escapedName}' and mimeType='${DRIVE_CONSTANTS.MIME_FOLDER}' and trashed=false`;
      
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id!;
      }
      return null;
    } catch (error) {
      Logger.error(`Failed to find folder ${name}`, error);
      throw error;
    }
  }

  /**
   * Creates a folder. Assumes duplicate check has already been performed.
   */
  static async createFolder(name: string, parentId?: string): Promise<string> {
    try {
      const drive = await getDriveService();
      const fileMetadata: any = {
        name,
        mimeType: DRIVE_CONSTANTS.MIME_FOLDER,
      };
      
      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const response = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      if (!response.data.id) throw new Error("Google Drive returned null ID");
      return response.data.id;
    } catch (error) {
      Logger.error(`Failed to create folder ${name}`, error);
      throw error;
    }
  }

  /**
   * Saves the root folder ID into settings.
   */
  static async updateRootFolder(folderId: string) {
    await prisma.integrationSettings.update({
      where: { provider: DRIVE_CONSTANTS.PROVIDER_ID },
      data: { rootFolderId: folderId }
    });
  }

  /**
   * Updates Client model with their specific Drive folder ID.
   */
  static async updateClientDriveFolder(clientId: string, folderId: string, folderUrl: string) {
    await prisma.client.update({
      where: { id: clientId },
      data: { driveFolderId: folderId, driveFolderUrl: folderUrl }
    });
  }

  /**
   * Updates Project model with all specific folder IDs.
   */
  static async updateProjectDriveFolders(
    projectId: string, 
    rootId: string, 
    rootUrl: string, 
    folders: Record<string, string>
  ) {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        driveRootFolderId: rootId,
        driveRootFolderUrl: rootUrl,
        rawFolderId: folders["RAW"],
        referencesFolderId: folders["Photos"],
        editFolderId: folders["Edited Videos"],
        deliveryFolderId: folders["Final Deliverables"],
        documentsFolderId: folders["Documents"],
      }
    });
  }
}
