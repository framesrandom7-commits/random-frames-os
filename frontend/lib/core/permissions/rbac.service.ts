import { verifySession } from "../../auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
