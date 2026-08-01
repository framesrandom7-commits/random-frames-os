import { verifySession } from "../../auth";
import { prisma } from "@/lib/prisma";
import { RbacDomainService } from "@/domain/rbac/service";

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
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!user || !user.role) return [];

  return user.role.permissions.map((rp) => rp.permission.action);
}

/**
 * Checks if a user has a specific permission via Domain RBAC logic.
 * Founder automatically bypasses all checks.
 */
export async function hasPermission(userId: string, action: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  const permissions = await getUserPermissions(userId);
  return RbacDomainService.hasPermission(user?.role?.name, action, permissions);
}

/**
 * Ensures the currently authenticated user has the given permission.
 * Intended for Server Actions and API routes.
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

/**
 * Helper to fetch current authenticated user's RBAC profile for UI and Action evaluations.
 */
export async function getCurrentUserRbac(): Promise<{
  userId: string;
  name: string | null;
  email: string;
  roleName: string | null;
  isFounder: boolean;
  isCoFounder: boolean;
} | null> {
  const session = await verifySession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true },
  });

  if (!user) return null;

  const roleName = user.role?.name || null;
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    roleName,
    isFounder: RbacDomainService.isFounder(roleName),
    isCoFounder: RbacDomainService.isCoFounder(roleName),
  };
}
