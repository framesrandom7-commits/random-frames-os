export interface LogDetails {
  module?: string;
  operation?: string;
  userId?: string;
  clientId?: string;
  projectId?: string;
  durationMs?: number;
  correlationId?: string;
  tags?: string[];
  [key: string]: any;
}

export class LoggerService {
  private static formatLog(level: string, message: string, details?: LogDetails, error?: any) {
    const timestamp = new Date().toISOString();
    
    let safeError = undefined;
    if (error) {
      safeError = error instanceof Error ? error.message : String(error);
      if (safeError.includes('refresh_token') || safeError.includes('access_token') || safeError.includes('password')) {
        safeError = '[REDACTED SENSITIVE DATA]';
      }
    }

    return JSON.stringify({
      timestamp,
      level,
      message,
      error: safeError,
      ...details
    });
  }

  public static debug(message: string, details?: LogDetails) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('DEBUG', message, details));
    }
  }

  public static info(message: string, details?: LogDetails) {
    console.info(this.formatLog('INFO', message, details));
  }

  public static warn(message: string, details?: LogDetails) {
    console.warn(this.formatLog('WARN', message, details));
  }

  public static error(message: string, error?: any, details?: LogDetails) {
    console.error(this.formatLog('ERROR', message, details, error));
  }

  public static critical(message: string, error?: any, details?: LogDetails) {
    // In future, trigger PagerDuty / Sentry alerting here
    console.error(this.formatLog('CRITICAL', message, details, error));
  }

  public static audit(message: string, details: LogDetails & { userId: string; action: string }) {
    console.info(this.formatLog('AUDIT', message, details));
    // Here we can also fire an EventBus event to save the audit log in the DB
  }
}
