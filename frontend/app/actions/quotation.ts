"use server";

import { QuotationStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NumberGenerator } from "@/lib/finance/number-generator.service";
import { FinanceService } from "@/domain/services/FinanceService";
import { checkFinanceRbac, checkFounderRbac } from "./rbac";
import { FinanceRbacEngine } from "@/domain/finance/finance-rbac";
import { prisma } from "@/lib/prisma";


export type QuotationItemData = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CreateQuotationData = {
  quotationNumber?: string;
  issueDate: Date;
  validUntil: Date;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  status?: QuotationStatus;
  notes?: string;
  termsAndConditions?: string;
  projectId?: string;
  clientId: string;
  items: QuotationItemData[];
};

export type UpdateQuotationData = Partial<Omit<CreateQuotationData, "items">> & { items?: QuotationItemData[] };

export async function createQuotation(data: CreateQuotationData) {
  try {
    const user = await checkFinanceRbac();

    const quoNum = data.quotationNumber || await NumberGenerator.generateQuotationNumber();
    
    // Server-side recalculation of totals
    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = subtotal - discount + tax;

    // Enforce discount limits via RBAC Engine
    if (discount > 0 && !FinanceRbacEngine.canApproveDiscount(user.role?.name, discount)) {
      throw new Error("403 Forbidden: Discount amount exceeds Co-Founder limit.");
    }

    const quotation = await FinanceService.createQuotation({
      quotationNumber: quoNum,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      total: total,
      status: data.status || "DRAFT",
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
      projectId: data.projectId,
      clientId: data.clientId,
      items: data.items,
    });
    
    revalidatePath("/finance/quotations");
    revalidatePath(`/clients/${data.clientId}`);
    if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
    
    return { success: true, quotation };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return { success: false, error: "Failed to create quotation" };
  }
}

export async function updateQuotation(id: string, data: UpdateQuotationData) {
  try {
    const user = await checkFinanceRbac();

    if (data.discount !== undefined && data.discount > 0) {
      if (!FinanceRbacEngine.canApproveDiscount(user.role?.name, data.discount)) {
        throw new Error("403 Forbidden: Discount amount exceeds Co-Founder limit.");
      }
    }

    // Since items are optional for updates, we must rely on the existing items if they aren't provided.
    // If they are provided, we should recalculate the total.
    let updatePayload = { ...data };
    if (data.items) {
      const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
      const discount = data.discount ?? 0;
      const tax = data.tax ?? 0;
      updatePayload.subtotal = subtotal;
      updatePayload.total = subtotal - discount + tax;
    } else if (data.subtotal !== undefined) {
      // In case the frontend tries to forge a subtotal update without items
      throw new Error("Cannot update subtotal directly without items.");
    }

    const quotation = await FinanceService.updateQuotation(id, updatePayload);

    revalidatePath("/finance/quotations");
    revalidatePath(`/finance/quotations/${id}`);
    revalidatePath(`/clients/${quotation.clientId}`);
    if (quotation.projectId) revalidatePath(`/projects/${quotation.projectId}`);
    
    return { success: true, quotation };
  } catch (error) {
    console.error("Error updating quotation:", error);
    return { success: false, error: "Failed to update quotation" };
  }
}

export async function getQuotations(params?: {
  clientId?: string;
  projectId?: string;
  status?: QuotationStatus;
  page?: number;
  limit?: number;
}) {
  try {
    return await FinanceService.getQuotations(params);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }
}

export async function getQuotationById(id: string) {
  try {
    return await FinanceService.getQuotation(id);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    throw new Error("Failed to fetch quotation");
  }
}

export async function getLatestApprovedQuotation(clientId: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const quotation = await prisma.quotation.findFirst({
      where: {
        clientId,
        status: "APPROVED"
      },
      orderBy: {
        approvedAt: "desc"
      }
    });
    return quotation;
  } catch (error) {
    console.error("Error fetching latest approved quotation:", error);
    return null;
  }
}

export async function createQuickApprovedQuotation(data: { clientId: string, discount: number, notes: string, items: QuotationItemData[] }) {
  try {
    const user = await checkFinanceRbac();

    if (data.discount > 0 && !FinanceRbacEngine.canApproveDiscount(user.role?.name, data.discount)) {
      throw new Error("403 Forbidden: Discount amount exceeds Co-Founder limit.");
    }

    const quoNum = await NumberGenerator.generateQuotationNumber();
    
    // Calculate subtotal
    const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const total = subtotal - (data.discount || 0);

    // Force recompile to pick up FinanceService changes v3
    const quotation = await FinanceService.createQuotation({
      quotationNumber: quoNum,
      issueDate: new Date(),
      validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      subtotal,
      discount: data.discount || 0,
      tax: 0,
      total,
      status: "APPROVED",
      notes: data.notes,
      clientId: data.clientId,
      items: data.items,
    });
    
    // Auto-approve it right after creation to set approval fields
    const { prisma } = await import("@/lib/prisma");
    await prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        approvedAt: new Date(),
        approvalMethod: "VERBAL", // Pre-approved via quick creation
      }
    });

    revalidatePath("/finance/quotations");
    revalidatePath(`/clients/${data.clientId}`);
    
    return { success: true, quotation };
  } catch (error: any) {
    console.error("Error creating quick quotation:", error);
    return { success: false, error: "Failed to create quick quotation" };
  }
}

export async function deleteQuotation(id: string) {
  try {
    await checkFinanceRbac();
    
    await prisma.quotation.delete({
      where: { id },
    });
    
    revalidatePath("/finance/quotations");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return { success: false, error: "Failed to delete quotation" };
  }
}

export async function deleteMultipleQuotations(ids: string[]) {
  try {
    await checkFinanceRbac();
    
    await prisma.quotation.deleteMany({
      where: { id: { in: ids } },
    });
    
    revalidatePath("/finance/quotations");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting multiple quotations:", error);
    return { success: false, error: "Failed to delete quotations" };
  }
}
