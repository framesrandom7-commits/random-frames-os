import { prisma } from "@/lib/prisma";

export class DriveRepository {
  static async updateClientDriveFolder(clientId: string, folderId: string, folderUrl: string) {
    return prisma.client.update({
      where: { id: clientId },
      data: { driveFolderId: folderId, driveFolderUrl: folderUrl }
    });
  }

  static async updateProjectDriveFolder(projectId: string, folderId: string, folderUrl: string) {
    return prisma.project.update({
      where: { id: projectId },
      data: { driveRootFolderId: folderId, driveRootFolderUrl: folderUrl }
    });
  }

  static async getClientDriveInfo(clientId: string) {
    return prisma.client.findUnique({
      where: { id: clientId },
      select: { driveFolderId: true, driveFolderUrl: true, businessName: true }
    });
  }

  static async getProjectDriveInfo(projectId: string) {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: { driveRootFolderId: true, driveRootFolderUrl: true, title: true, client: { select: { driveFolderId: true, businessName: true } } }
    });
  }
}
