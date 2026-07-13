"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings(keys?: string[]) {
  const where = keys && keys.length > 0 ? { key: { in: keys } } : {};
  const settings = await prisma.setting.findMany({ where });
  
  const result: Record<string, any> = {};
  settings.forEach(s => {
    // The value is stored as JSON
    result[s.key] = s.value;
  });
  
  return result;
}

export async function getSetting(key: string) {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting ? setting.value : null;
}

export async function updateSetting(key: string, value: any) {
  // Prisma doesn't strictly allow `any` in Json fields without ensuring it's serializable,
  // but Prisma client maps JavaScript objects to JSON automatically.
  // Using JSON.parse(JSON.stringify(value)) ensures no weird object references.
  const serializableValue = JSON.parse(JSON.stringify(value));
  
  await prisma.setting.upsert({
    where: { key },
    update: { value: serializableValue },
    create: { key, value: serializableValue },
  });
  
  revalidatePath('/settings');
  return { success: true };
}

export async function exportDatabaseBackup() {
  // Fetch all critical data
  const [
    settings,
    users,
    clients,
    leads,
    projects,
    shoots,
    invoices,
    expenses,
    payments
  ] = await Promise.all([
    prisma.setting.findMany(),
    prisma.user.findMany(),
    prisma.client.findMany(),
    prisma.lead.findMany(),
    prisma.project.findMany(),
    prisma.shoot.findMany(),
    prisma.invoice.findMany(),
    prisma.expense.findMany(),
    prisma.payment.findMany()
  ]);

  const backup = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    data: {
      settings,
      users,
      clients,
      leads,
      projects,
      shoots,
      invoices,
      expenses,
      payments
    }
  };

  return backup;
}
