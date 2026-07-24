"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      contactEmail: true,
      role: {
        select: {
          id: true,
          name: true,
        }
      },
      createdAt: true,
      archivedAt: true
    }
  });
}

export async function getRoles() {
  return await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true
        }
      },
      _count: {
        select: { users: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// These legacy functions are placeholders and should be removed if not used elsewhere
export async function createUser(data: { name: string; email: string; roleId: string }) {
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      roleId: data.roleId,
      passwordHash: "PLACEHOLDER_HASH_CHANGE_ME" 
    }
  });
  
  revalidatePath('/settings');
  return { success: true };
}

export async function updateUserRole(id: string, roleId: string) {
  await prisma.user.update({
    where: { id },
    data: { roleId }
  });
  
  revalidatePath('/settings');
  return { success: true };
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id }
  });
  
  revalidatePath('/settings');
  return { success: true };
}

export async function resetUserPassword(id: string) {
  // Just a placeholder for V1.0 since we don't have a mailer set up
  await prisma.user.update({
    where: { id },
    data: { passwordHash: "NEW_PLACEHOLDER_HASH" }
  });
  
  return { success: true, message: "Password reset link sent (simulated)." };
}

import { verifySession } from "@/lib/auth";

export async function getCurrentProfile() {
  const session = await verifySession();
  if (!session) return null;

  return await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      contactEmail: true,
      role: {
        select: {
          name: true,
        }
      },
    }
  });
}

export async function updateProfile(formData: FormData) {
  const session = await verifySession();
  if (!session) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const contactEmail = formData.get("contactEmail") as string;
  
  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name, contactEmail: contactEmail || null }
    });
    revalidatePath("/profile");
    return { success: "Profile updated successfully." };
  } catch (e) {
    return { error: "Failed to update profile." };
  }
}
