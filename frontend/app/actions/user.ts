"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
}

export async function createUser(data: { name: string; email: string; role: Role }) {
  // In a real app, you would hash the password properly and send an invite email.
  // For V1.0 settings module, we use a placeholder hash.
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash: "PLACEHOLDER_HASH_CHANGE_ME" 
    }
  });
  
  revalidatePath('/settings');
  return { success: true };
}

export async function updateUserRole(id: string, role: Role) {
  await prisma.user.update({
    where: { id },
    data: { role }
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
