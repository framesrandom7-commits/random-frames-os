import { PrismaClient } from "@prisma/client";
import { verifySession } from "../../auth";
import { redirect } from "next/navigation";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Fetches all permissions for a specific user ID
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  if (!user || !user.role) return [];

  return user.role.permissions.map(rp => rp.permission.action);
}

/**
 * Checks if a user has a specific permission
 */
export async function hasPermission(userId: string, action: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(action);
}

/**
 * Ensures the currently authenticated user has the given permission.
 * Intended for Server Actions and API routes.
 * Throws an error or returns a failure object if unauthorized.
 */
export async function requirePermission(action: string): Promise<{ userId: string }> {
  const session = await verifySession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const authorized = await hasPermission(session.userId, action);
  if (!authorized) {
    throw new Error(`Permission denied: Missing '${action}'`);
  }

  return { userId: session.userId };
}
