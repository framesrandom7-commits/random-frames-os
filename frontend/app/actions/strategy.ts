"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClientStrategy(clientId: string) {
  try {
    const strategy = await prisma.clientStrategy.findUnique({
      where: { clientId }
    });
    return strategy;
  } catch (error) {
    console.error("[GET_CLIENT_STRATEGY_ERROR]", error);
    return null;
  }
}

export async function upsertClientStrategy(
  clientId: string,
  data: {
    brandGuidelines?: string;
    targetAudience?: string;
    coreObjectives?: string;
    referenceLinks?: string;
    documents?: string;
  }
) {
  try {
    const strategy = await prisma.clientStrategy.upsert({
      where: { clientId },
      create: {
        clientId,
        ...data,
      },
      update: {
        ...data,
      }
    });

    revalidatePath(`/clients/${clientId}/workspace`);
    return { success: true, strategy };
  } catch (error) {
    console.error("[UPSERT_CLIENT_STRATEGY_ERROR]", error);
    return { success: false, error: "Failed to update strategy" };
  }
}
