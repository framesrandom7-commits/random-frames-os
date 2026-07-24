import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { errorResponse, ApiResponse } from "../api/response";
import { LoggerService } from "../logger/logger.service";

export class GlobalErrorService {
  
  /**
   * Handles any thrown exception and returns a standardized ApiResponse
   */
  public static handleError(error: unknown, context?: string): ApiResponse<null> {
    const errorMsg = error instanceof Error ? error.message : "An unknown error occurred";
    
    // Log the error
    LoggerService.error(`[${context || 'GlobalError'}] ${errorMsg}`, error);

    // Handle Zod Validation Errors
    if (error instanceof ZodError) {
      const issues = (error as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(", ");
      return errorResponse("VALIDATION_ERROR", "Invalid input data", { details: issues });
    }

    // Handle Prisma Database Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return errorResponse("CONFLICT", "A record with this value already exists.");
      }
      if (error.code === 'P2025') {
        return errorResponse("NOT_FOUND", "Record not found.");
      }
      return errorResponse("DATABASE_ERROR", "A database operation failed.");
    }
    
    // Handle Custom App Errors
    if (error instanceof AppError) {
      return errorResponse(error.code, error.message, error.metadata);
    }

    // Default Fallback
    return errorResponse("INTERNAL_SERVER_ERROR", errorMsg);
  }
}

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "BAD_REQUEST",
    public metadata?: Record<string, any>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "UNAUTHORIZED");
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}
