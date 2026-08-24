import { prisma } from "./prisma";
import { getDriveService } from "./google";
import { QueueService } from "./queue.service";
import { Logger } from "./logger";

import { DriveDomainService } from "@/domain/drive/service";

export class DriveService {
  static async createClientFolders(clientId: string, clientName: string): Promise<boolean> {
    try {
      await DriveDomainService.createClientFolders(clientId, clientName);
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
      await DriveDomainService.createProjectFolders(projectId, projectName, clientFolderId);
      return true;
    } catch (error: any) {
      Logger.error("[DriveService] Project folder creation failed.", error);
      await QueueService.pushJob("GOOGLE_DRIVE", "CREATE_PROJECT_FOLDERS", { projectId, projectName, clientFolderId }, error.message);
      return false;
    }
  }
}
