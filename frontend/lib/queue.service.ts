import { prisma } from './prisma';
import { Logger } from './logger';

export class QueueService {
  /**
   * Pushes a failed job to the retry queue
   */
  static async pushJob(provider: string, action: string, payload: any, lastError: string) {
    try {
      await prisma.integrationJobQueue.create({
        data: {
          provider,
          action,
          payload,
          status: 'QUEUED',
          nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 mins
          lastError,
        }
      });
      Logger.info(`Pushed failed ${provider} action to Queue`, { module: 'Queue', action });
    } catch (error) {
      Logger.error(`Failed to push job to Queue`, error);
    }
  }

  /**
   * Calculate exponential backoff
   * @param retryCount Number of previous retries
   * @returns Next retry date
   */
  static getNextRetryDate(retryCount: number): Date {
    const baseDelayMinutes = 5;
    const delayMinutes = baseDelayMinutes * Math.pow(2, retryCount);
    return new Date(Date.now() + delayMinutes * 60 * 1000);
  }
}
