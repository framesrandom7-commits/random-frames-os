import { Logger } from '@/lib/logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  module?: string;
  operation?: string;
}

const isRetryableError = (error: any): boolean => {
  // Google API specific error checks
  const status = error?.code || error?.response?.status;
  
  if (status === 429) return true; // Rate Limit Exceeded
  if (status === 500) return true; // Internal Server Error
  if (status === 502) return true; // Bad Gateway
  if (status === 503) return true; // Service Unavailable
  if (status === 504) return true; // Gateway Timeout
  
  const message = (error?.message || '').toLowerCase();
  if (message.includes('network') || message.includes('econnreset') || message.includes('etimedout')) {
    return true; // Network failure
  }
  
  // Do NOT retry 400 (Bad Request), 401 (Unauthorized), 403 (Permission Denied/Quota Exceeded), 404 (Not Found)
  return false;
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    backoffFactor = 2,
    module = 'Unknown',
    operation: opName = 'UnknownOperation'
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      const startTime = Date.now();
      const result = await operation();
      const durationMs = Date.now() - startTime;
      
      // Log successful operation if it took retries to succeed
      if (attempt > 0) {
        Logger.info(`Operation succeeded after retries`, {
          module,
          operation: opName,
          status: 'SUCCESS',
          durationMs,
          retries: attempt,
        });
      }
      return result;
    } catch (error: any) {
      attempt++;
      
      if (!isRetryableError(error) || attempt > maxRetries) {
        // Log final failure
        Logger.error(`Operation failed permanently`, error, {
          module,
          operation: opName,
          status: 'ERROR',
          retries: attempt - 1,
          errorCode: error?.code || error?.response?.status
        });
        throw error;
      }
      
      // Log retry attempt
      Logger.warn(`Transient error encountered, scheduling retry`, {
        module,
        operation: opName,
        status: 'WARN',
        retries: attempt,
        nextRetryDelayMs: delay,
        errorCode: error?.code || error?.response?.status
      });
      
      // Wait before retrying
      await new Promise(res => setTimeout(res, delay));
      delay *= backoffFactor; // Exponential backoff
    }
  }
};
