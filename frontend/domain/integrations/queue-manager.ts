import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export class QueueManager {
  static async pushJob(
    provider: string,
    action: string,
    payload: any,
    lastError?: string
  ) {
    try {
      await prisma.integrationJobQueue.create({
        data: {
          provider,
          action,
          payload,
          status: 'QUEUED',
          lastError,
          retryCount: 0,
          nextRetryAt: new Date(Date.now() + 60000) // retry after 1 min
        }
      });
      Logger.info(`Job queued for ${provider}:${action}`);
    } catch (error) {
      Logger.error(`Failed to push job for ${provider}:${action}`, error);
    }
  }

  static async markJobCompleted(jobId: string) {
    await prisma.integrationJobQueue.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', updatedAt: new Date() }
    });
  }

  static async markJobFailed(jobId: string, errorMsg: string, currentRetryCount: number) {
    const maxRetries = 5;
    const isExhausted = currentRetryCount >= maxRetries;
    const nextRetryAt = isExhausted ? null : new Date(Date.now() + Math.pow(2, currentRetryCount) * 60000); // Exponential backoff

    await prisma.integrationJobQueue.update({
      where: { id: jobId },
      data: {
        status: isExhausted ? 'FAILED' : 'QUEUED',
        lastError: errorMsg,
        retryCount: { increment: 1 },
        nextRetryAt,
        updatedAt: new Date()
      }
    });
  }
}
