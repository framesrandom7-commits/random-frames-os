"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ClientContentMetric } from "@prisma/client";

export async function getClientContentMetrics(clientId: string) {
  try {
    const metrics = await prisma.clientContentMetric.findMany({
      where: { clientId },
      orderBy: { publishedAt: 'desc' }
    });
    return metrics;
  } catch (error) {
    console.error("[GET_CONTENT_METRICS_ERROR]", error);
    return [];
  }
}

export async function createContentMetric(data: {
  clientId: string;
  title: string;
  platform: string;
  publishedUrl?: string;
  publishedAt: Date;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  linkClicks?: number;
  leadsGenerated?: number;
  adSpend?: number;
}) {
  try {
    const metric = await prisma.clientContentMetric.create({
      data: {
        ...data,
      }
    });
    revalidatePath(`/clients/${data.clientId}/workspace`);
    return { success: true, metric };
  } catch (error) {
    console.error("[CREATE_CONTENT_METRIC_ERROR]", error);
    return { success: false, error: "Failed to log metric" };
  }
}

export async function deleteContentMetric(id: string, clientId: string) {
  try {
    await prisma.clientContentMetric.delete({
      where: { id }
    });
    revalidatePath(`/clients/${clientId}/workspace`);
    return { success: true };
  } catch (error) {
    console.error("[DELETE_CONTENT_METRIC_ERROR]", error);
    return { success: false, error: "Failed to delete metric" };
  }
}
