import { LoggerService, LogDetails as NewLogDetails } from "./core/logger/logger.service";

export interface LogDetails extends NewLogDetails {
  status?: 'SUCCESS' | 'ERROR' | 'PENDING' | 'WARN' | 'INFO';
}

export const Logger = {
  info: (message: string, details?: LogDetails) => LoggerService.info(message, details),
  warn: (message: string, details?: LogDetails) => LoggerService.warn(message, details),
  error: (message: string, error?: any, details?: LogDetails) => LoggerService.error(message, error, details),
};
