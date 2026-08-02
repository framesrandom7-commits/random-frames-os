import { DriveRepository as BaseDriveRepo } from "@/domain/drive/repository";

/**
 * Workspace Drive Repository wrapper.
 * Re-exports existing DriveRepository to strictly maintain zero duplicate repositories in the frozen architecture.
 */
export class WorkspaceDriveRepository {
  static findFolder = BaseDriveRepo.findFolder;
  static createFolder = BaseDriveRepo.createFolder;
  static updateRootFolder = BaseDriveRepo.updateRootFolder;
  static updateClientDriveFolder = BaseDriveRepo.updateClientDriveFolder;
  static updateProjectDriveFolders = BaseDriveRepo.updateProjectDriveFolders;
}
