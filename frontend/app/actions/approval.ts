"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { checkFinanceRbac, checkFounderRbac } from "./rbac";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export async function requestApproval(entityType: string, entityId: string, comments?: string) {
  try {
    const user = await checkFinanceRbac();

    // Check if pending approval already exists
    const existing = await prisma.approval.findFirst({
      where: {
        entityType,
        entityId,
        status: "PENDING",
      }
    });

    if (existing) {
      throw new Error("An approval request is already pending for this item.");
    }

    const approval = await prisma.approval.create({
      data: {
        entityType,
        entityId,
        requestedById: user.id,
        comments,
      }
    });

    // We don't know the exact path without context, but we can revalidate the root finance/deliverable pages
    if (entityType === "DELIVERABLE") {
      revalidatePath("/shoots");
    } else if (entityType === "QUOTATION" || entityType === "DISCOUNT") {
      revalidatePath("/finance/quotations");
      revalidatePath("/finance/invoices");
    }

    return { success: true, approval };
  } catch (error) {
    console.error("Error in requestApproval:", error);
    return GlobalErrorService.handleError(error, "Action:requestApproval");
  }
}

export async function resolveApproval(approvalId: string, status: "APPROVED" | "REJECTED", comments?: string) {
  try {
    const user = await checkFounderRbac();

    const approval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status,
        approvedById: user.id,
        resolvedAt: new Date(),
        comments: comments ? comments : undefined,
      }
    });

    if (approval.entityType === "DELIVERABLE") {
      revalidatePath("/shoots");
    } else if (approval.entityType === "QUOTATION" || approval.entityType === "DISCOUNT") {
      revalidatePath("/finance/quotations");
      revalidatePath("/finance/invoices");
    }

    return { success: true, approval };
  } catch (error) {
    console.error("Error in resolveApproval:", error);
    return GlobalErrorService.handleError(error, "Action:resolveApproval");
  }
}
