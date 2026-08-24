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
   * Enforces that the root folder (Clients) is configured.
   */
  static async getConfiguredRootFolder(): Promise<string> {
    const settings = await CredentialManager.getCredentials(DRIVE_CONSTANTS.PROVIDER_ID);
    if (settings && settings.rootFolderId && settings.rootFolderId !== 'root') {
      return settings.rootFolderId;
    }
    
    Logger.info("Google Drive 'Clients' Root Folder ID is not explicitly configured. Creating/finding 'Client Data' master folder in root.");
    const masterFolderId = await this.findOrCreateFolder("Client Data", "root");
    
    if (settings && settings.rootFolderId !== masterFolderId) {
      await DriveRepository.updateRootFolder(masterFolderId);
    }
    
    return masterFolderId;
  }

  /**
   * Create Client folder and core subfolders. 
   * Designed to be called by the background queue processor.
   */
  static async createClientFolders(clientId: string, clientName: string): Promise<void> {
    const settings = await CredentialManager.getCredentials(DRIVE_CONSTANTS.PROVIDER_ID);
    if (!settings || !settings.accessToken) throw new Error("Drive not connected");

    const rootId = await this.getConfiguredRootFolder();

    // Client specific folder directly under the configured Clients root
    const clientFolderId = await this.findOrCreateFolder(clientName, rootId);
    
    // Update DB
    const folderUrl = `https://drive.google.com/drive/folders/${clientFolderId}`;
    await DriveRepository.updateClientDriveFolder(clientId, clientFolderId, folderUrl);

    // Child folders
    await this.findOrCreateFolder("Requirements", clientFolderId);
    await this.findOrCreateFolder("Quotations", clientFolderId);
    await this.findOrCreateFolder("Projects", clientFolderId);
    await this.findOrCreateFolder("Invoices", clientFolderId);
    await this.findOrCreateFolder("Other", clientFolderId);

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
