import { QueueManager } from "./queue-manager";

export class RetryManager {
  /**
   * Wrapper for executing API calls with built-in retry queuing for CRM safety.
   */
  static async executeSafe<T>(
    provider: string,
    action: string,
    payload: any,
    apiCall: () => Promise<T>
  ): Promise<T | null> {
    try {
      return await apiCall();
    } catch (error: any) {
      await QueueManager.pushJob(provider, action, payload, error.message);
      return null;
    }
  }
}
