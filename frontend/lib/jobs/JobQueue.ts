import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export class JobQueueService {
  /**
   * Enqueue a new background job.
   */
  public async enqueue(type: string, payload: any) {
    try {
      const job = await prisma.backgroundJob.create({
        data: {
          type,
          payload,
          status: 'QUEUED',
        }
      });
      Logger.info(`[JobQueue] Enqueued job ${job.id} of type ${type}`);
      
      // Kickoff processing asynchronously without blocking
      this.processNext(type).catch(err => Logger.error(`[JobQueue] Error triggering processNext for ${type}`, err));
      
      return job;
    } catch (error) {
      Logger.error(`[JobQueue] Failed to enqueue job ${type}`, error);
      throw error;
    }
  }

  /**
   * Simple processor to pick the next queued job of a specific type.
   * In a true distributed system, this would be a long-polling worker.
   */
  private async processNext(type: string) {
    // 1. Find the oldest QUEUED job of this type.
    const job = await prisma.backgroundJob.findFirst({
      where: { type, status: 'QUEUED' },
      orderBy: { createdAt: 'asc' }
    });

    if (!job) return; // Queue empty

    // 2. Mark as RUNNING
    await prisma.backgroundJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', startedAt: new Date() }
    });

    try {
      Logger.info(`[JobQueue] Processing job ${job.id} (${type})`);
      
      // Execute the job logic
      await this.executeJob(job.type, job.payload);

      // Mark COMPLETED
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: { status: 'COMPLETED', progress: 100, completedAt: new Date() }
      });
      Logger.info(`[JobQueue] Completed job ${job.id} (${type})`);
      
    } catch (error: any) {
      Logger.error(`[JobQueue] Failed job ${job.id} (${type})`, error);
      
      // Mark FAILED or RETRYING
      const retryCount = job.retryCount + 1;
      const status = retryCount > 3 ? 'FAILED' : 'RETRYING';
      
      await prisma.backgroundJob.update({
        where: { id: job.id },
        data: { 
          status, 
          error: error.message,
          retryCount
        }
      });
      
      if (status === 'RETRYING') {
        // Simple backoff retry (fire and forget after timeout)
        setTimeout(() => this.processNext(type), 5000 * retryCount);
      }
    }
  }

  /**
   * Router for job execution based on type.
   */
  private async executeJob(type: string, payload: any): Promise<void> {
    const { 
      createProjectStorageFolders, 
      createClientStorageFolders, 
      createShootStorageFolders 
    } = await import('@/lib/storage/automation');
    
    switch (type) {
      case 'CREATE_PROJECT_FOLDERS':
        if (!payload.projectId || !payload.clientName || !payload.projectName || !payload.clientDriveFolderId) {
           throw new Error("Missing payload for CREATE_PROJECT_FOLDERS");
        }
        await createProjectStorageFolders(payload.userId, payload.projectId, payload.projectName, payload.clientDriveFolderId);
        break;

      case 'CREATE_CLIENT_FOLDERS':
        if (!payload.clientId || !payload.clientName) {
           throw new Error("Missing payload for CREATE_CLIENT_FOLDERS");
        }
        await createClientStorageFolders(payload.userId, payload.clientId, payload.clientName);
        break;

      case 'CREATE_SHOOT_FOLDERS':
        if (!payload.shootId || !payload.shootName || !payload.projectDriveRootFolderId) {
           throw new Error("Missing payload for CREATE_SHOOT_FOLDERS");
        }
        await createShootStorageFolders(payload.userId, payload.shootId, payload.shootName, payload.projectDriveRootFolderId);
        break;
        
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  }
}

export const JobQueue = new JobQueueService();
