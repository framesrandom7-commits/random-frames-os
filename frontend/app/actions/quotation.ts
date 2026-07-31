"use server";

import { QuotationStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { NumberGenerator } from "@/lib/finance/number-generator.service";
import { FinanceService } from "@/domain/services/FinanceService";

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
  projectId: string;
  clientId: string;
  items: QuotationItemData[];
};

export type UpdateQuotationData = Partial<Omit<CreateQuotationData, "items">> & { items?: QuotationItemData[] };

export async function createQuotation(data: CreateQuotationData) {
  try {
    const quoNum = data.quotationNumber || await NumberGenerator.generateQuotationNumber();
    
    const quotation = await FinanceService.createQuotation({
      quotationNumber: quoNum,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      subtotal: data.subtotal,
      discount: data.discount || 0,
      tax: data.tax || 0,
      total: data.total,
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
    const quotation = await FinanceService.updateQuotation(id, data);

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
