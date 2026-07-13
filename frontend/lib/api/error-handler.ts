import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { formatError } from "./response";

export const handleError = (error: unknown) => {
  if (process.env.NODE_ENV === "development") {
    console.error("[API Error]:", error);
  }

  if (error instanceof ZodError) {
    return formatError("Validation Error", error.format(), 400);
  }

  // Handle Prisma specific errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return formatError("Unique constraint failed", error.meta, 409);
    }
    if (error.code === "P2025") {
      return formatError("Record not found", error.meta, 404);
    }
  }

  return formatError("Internal Server Error", undefined, 500);
};
