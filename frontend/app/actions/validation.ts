"use server";

import { prisma } from "@/lib/prisma";

export async function checkUniqueContact(
  field: "email" | "phone",
  value: string,
  excludeId?: string
): Promise<{ isUnique: boolean; conflictingEntity?: "lead" | "client" }> {
  if (!value) return { isUnique: true };

  // Check Leads
  const leadMatch = await prisma.lead.findFirst({
    where: {
      [field]: value,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      archivedAt: null
    },
    select: { id: true }
  });

  if (leadMatch) {
    return { isUnique: false, conflictingEntity: "lead" };
  }

  // Check Clients
  const clientMatch = await prisma.client.findFirst({
    where: {
      [field]: value,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      archivedAt: null
    },
    select: { id: true }
  });

  if (clientMatch) {
    return { isUnique: false, conflictingEntity: "client" };
  }

  return { isUnique: true };
}
