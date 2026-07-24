/**
 * Structured Logger
 * Emits logs with timestamp, module, operation, and status.
 */

export interface LogDetails {
  module: string;
  operation: string;
  status: 'SUCCESS' | 'ERROR' | 'PENDING' | 'WARN' | 'INFO';
  durationMs?: number;
  errorCode?: string;
  correlationId?: string;
  [key: string]: any;
}

export const Logger = {
  info: (message: string, details: LogDetails) => {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({ timestamp, level: 'INFO', message, ...details }));
  },
  
  warn: (message: string, details: LogDetails) => {
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({ timestamp, level: 'WARN', message, ...details }));
  },
  
  error: (message: string, error: any, details: LogDetails) => {
    const timestamp = new Date().toISOString();
    
    // Attempt to mask sensitive secrets if accidentally logged
    let safeErrorMessage = error?.message || String(error);
    if (safeErrorMessage.includes('refresh_token') || safeErrorMessage.includes('access_token')) {
      safeErrorMessage = '[REDACTED TOKEN ERROR]';
    }

    console.error(JSON.stringify({
      timestamp,
      level: 'ERROR',
      message,
      error: safeErrorMessage,
      ...details
    }));
  }
};
