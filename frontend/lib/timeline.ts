import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export type LogActivityParams = {
  type: ActivityType;
  description: string;
  metadata?: any;
  leadId?: string;
  clientId?: string;
  projectId?: string;
  shootId?: string;
  invoiceId?: string;
  paymentId?: string;
  expenseId?: string;
  createdBy?: string;
};

export async function logActivity(params: LogActivityParams) {
  try {
    const activity = await prisma.activity.create({
      data: params
    });
    return { success: true, activity };
  } catch (error) {
    console.error("Failed to log activity:", error);
    return { success: false, error: "Failed to log activity" };
  }
}
