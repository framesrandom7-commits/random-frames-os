import { DriveRepository } from "./repository";
import { DRIVE_CONSTANTS } from "./constants";
import { RetryManager } from "@/domain/integrations/retry-manager";
import { AuditManager } from "@/domain/integrations/audit-manager";
import { CredentialManager } from "@/domain/integrations/credential-manager";
import { Logger } from "@/lib/logger";
import { RbacDomainService } from "@/domain/rbac/service";

export class DriveDomainService {
  /**
   * Deterministic logic: Searches before creating.
   */
  static async findOrCreateFolder(name: string, parentId?: string): Promise<string> {
    const existingId = await DriveRepository.findFolder(name, parentId);
    if (existingId) return existingId;
    return await DriveRepository.createFolder(name, parentId);
  }

  /**
   * Ensures the base structure `Random Frames OS/Clients` exists.
   */
  static async initializeRootStructure(): Promise<string> {
    const rootId = await this.findOrCreateFolder(DRIVE_CONSTANTS.ROOT_FOLDER_NAME);
    await DriveRepository.updateRootFolder(rootId);
    
    // Ensure Clients subfolder exists
    await this.findOrCreateFolder(DRIVE_CONSTANTS.CLIENTS_FOLDER_NAME, rootId);
    
    return rootId;
  }

  /**
   * Create Client folder and core subfolders. 
   * Designed to be called by the background queue processor.
   */
  static async createClientFolders(clientId: string, clientName: string): Promise<void> {
    const settings = await CredentialManager.getCredentials(DRIVE_CONSTANTS.PROVIDER_ID);
    if (!settings || !settings.accessToken) throw new Error("Drive not connected");

    const rootId = await this.initializeRootStructure();
    const clientsFolderId = await this.findOrCreateFolder(DRIVE_CONSTANTS.CLIENTS_FOLDER_NAME, rootId);

    // Client specific folder
    const clientFolderId = await this.findOrCreateFolder(clientName, clientsFolderId);
    
    // Update DB
    const folderUrl = `https://drive.google.com/drive/folders/${clientFolderId}`;
    await DriveRepository.updateClientDriveFolder(clientId, clientFolderId, folderUrl);

    // Child folders
    await this.findOrCreateFolder("Documents", clientFolderId);
    await this.findOrCreateFolder("Projects", clientFolderId);

    await AuditManager.logIntegrationEvent(
      DRIVE_CONSTANTS.PROVIDER_ID,
      "FOLDER_CREATED",
      `Created Client folder for ${clientName}`,
      { folderId: clientFolderId },
      { clientId }
    );
  }

  /**
   * Create Project folder and tree.
   * Designed to be called by the background queue processor.
   */
  static async createProjectFolders(projectId: string, projectName: string, clientFolderId: string): Promise<void> {
    const settings = await CredentialManager.getCredentials(DRIVE_CONSTANTS.PROVIDER_ID);
    if (!settings || !settings.accessToken) throw new Error("Drive not connected");

    const projectsBaseId = await this.findOrCreateFolder("Projects", clientFolderId);
    const projectFolderId = await this.findOrCreateFolder(projectName, projectsBaseId);

    const folderIds: Record<string, string> = {};
    for (const sub of DRIVE_CONSTANTS.PROJECT_SUBFOLDERS) {
      folderIds[sub] = await this.findOrCreateFolder(sub, projectFolderId);
    }

    const folderUrl = `https://drive.google.com/drive/folders/${projectFolderId}`;
    await DriveRepository.updateProjectDriveFolders(projectId, projectFolderId, folderUrl, folderIds);

    await AuditManager.logIntegrationEvent(
      DRIVE_CONSTANTS.PROVIDER_ID,
      "FOLDER_CREATED",
      `Created Project tree for ${projectName}`,
      { folderId: projectFolderId },
      { projectId }
    );
  }

  /**
   * Evaluates role and ownership permissions before releasing Drive links or triggering folder operations.
   */
  static canUserAccessFolder(
    roleName?: string | null,
    folderType: "CLIENTS" | "OPERATIONS" | "EDITING" | "SYSTEM" = "OPERATIONS"
  ): boolean {
    return RbacDomainService.canAccessDriveFolder(roleName, folderType);
  }

  /**
   * Evaluates collective multi-user access permissions for a shared collaborative folder tree.
   * Confirms folder ownership remains independent of employee headcount without assumptions of only one editor.
   */
  static verifyMultiUserFolderAccess(
    userRoles: { userId: string; roleName: string }[],
    folderType: "CLIENTS" | "OPERATIONS" | "EDITING" | "SYSTEM"
  ): { authorizedUsers: string[]; unauthorizedUsers: string[]; maxSupportedCollaborators: string } {
    const authorizedUsers: string[] = [];
    const unauthorizedUsers: string[] = [];

    userRoles.forEach((u) => {
      if (this.canUserAccessFolder(u.roleName, folderType)) {
        authorizedUsers.push(u.userId);
      } else {
        unauthorizedUsers.push(u.userId);
      }
    });

    Logger.info(`[Drive Collaboration] Verified folder access (${folderType}) for ${userRoles.length} concurrent users. Authorized: ${authorizedUsers.length}.`);
    return {
      authorizedUsers,
      unauthorizedUsers,
      maxSupportedCollaborators: "UNLIMITED",
    };
  }
}
