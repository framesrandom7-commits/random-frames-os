import { prisma } from "@/lib/prisma";
import { DRIVE_CONSTANTS } from "@/domain/drive/constants";

export async function getClientDriveSyncStatus(clientId: string) {
  const jobs = await prisma.integrationJobQueue.findMany({
    where: { 
      provider: DRIVE_CONSTANTS.PROVIDER_ID,
      payload: {
        path: ['clientId'],
        equals: clientId,
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 1,
  });

  return jobs.length > 0 ? jobs[0] : null;
}

export async function getProjectDriveSyncStatus(projectId: string) {
  const jobs = await prisma.integrationJobQueue.findMany({
    where: { 
      provider: DRIVE_CONSTANTS.PROVIDER_ID,
      payload: {
        path: ['projectId'],
        equals: projectId,
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 1,
  });

  return jobs.length > 0 ? jobs[0] : null;
}
