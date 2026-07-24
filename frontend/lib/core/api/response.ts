export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Creates a standardized successful API response
 */
export function successResponse<T>(data: T, message?: string, metadata?: Record<string, any>): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a standardized error API response
 */
export function errorResponse(error: string, message?: string, metadata?: Record<string, any>): ApiResponse<null> {
  return {
    success: false,
    error,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };
}
