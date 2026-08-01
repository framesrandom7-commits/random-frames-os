"use server";

import { revalidatePath } from "next/cache";
import { DriveRepository } from "@/domain/drive/repository";
import { CredentialManager } from "@/domain/integrations/credential-manager";
import { DRIVE_CONSTANTS } from "@/domain/drive/constants";
import { DriveDomainService } from "@/domain/drive/service";
import { QueueManager } from "@/domain/integrations/queue-manager";

import { prisma } from "@/lib/prisma";
import { getDriveService } from "@/lib/google";

export async function getDriveStatus() {
  const credentials = await CredentialManager.getCredentials(DRIVE_CONSTANTS.PROVIDER_ID);
  
  if (!credentials) {
    return {
      connected: false,
      status: "DISCONNECTED",
    };
  }

  // Get jobs
  const jobs = await prisma.integrationJobQueue.findMany({
    where: { provider: DRIVE_CONSTANTS.PROVIDER_ID },
    orderBy: { updatedAt: "desc" },
    take: 10,
  });
  
  const lastSyncJob = jobs.find((j: any) => j.status === "COMPLETED");
  const failedJobs = jobs.filter((j: any) => j.status === "FAILED");
  const lastErrorJob = failedJobs.length > 0 ? failedJobs[0] : null;

  return {
    connected: !!credentials.accessToken,
    status: credentials.syncStatus,
    lastSync: lastSyncJob?.updatedAt,
    lastError: lastErrorJob?.lastError,
  };
}

export async function testConnection() {
  try {
    const drive = await getDriveService();
    await drive.files.list({ pageSize: 1 });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function disconnectDrive() {
  await prisma.integrationSettings.delete({ where: { provider: DRIVE_CONSTANTS.PROVIDER_ID } });
  revalidatePath("/settings/integrations/google-drive");
  return { success: true };
}

export async function repairDriveStructure() {
  try {
    await DriveDomainService.initializeRootStructure();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
