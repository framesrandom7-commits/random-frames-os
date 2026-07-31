"use server";

import { InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FinanceService } from "@/domain/services/FinanceService";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export type InvoiceItemData = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CreateInvoiceData = {
  invoiceNumber?: string;
  issueDate: Date;
  dueDate: Date;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  status?: InvoiceStatus;
  notes?: string;
  projectId: string;
  clientId: string;
  items?: InvoiceItemData[];
};

export type UpdateInvoiceData = Partial<Omit<CreateInvoiceData, "items">> & { items?: InvoiceItemData[] };

export async function generateInvoiceNumber(): Promise<string> {
  return FinanceService.generateInvoiceNumber();
}

export async function createInvoice(data: CreateInvoiceData) {
  try {
    const invoice = await FinanceService.createInvoice(data);
    
    revalidatePath("/finance/invoices");
    revalidatePath(`/clients/${data.clientId}`);
    if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
    
    return { success: true, invoice };
  } catch (error) {
    console.error("Error in createInvoice:", error);
    return GlobalErrorService.handleError(error, "Action:createInvoice");
  }
}

export async function updateInvoice(id: string, data: UpdateInvoiceData) {
  try {
    const invoice = await FinanceService.updateInvoice(id, data);
    
    revalidatePath("/finance/invoices");
    revalidatePath(`/finance/invoices/${id}`);
    revalidatePath(`/clients/${invoice.clientId}`);
    if (invoice.projectId) revalidatePath(`/projects/${invoice.projectId}`);
    
    return { success: true, invoice };
  } catch (error) {
    console.error("Error in updateInvoice:", error);
    return GlobalErrorService.handleError(error, "Action:updateInvoice");
  }
}

export async function deleteInvoice(id: string) {
  try {
    const invoice = await FinanceService.deleteInvoice(id);
    
    revalidatePath("/finance/invoices");
    revalidatePath(`/clients/${invoice.clientId}`);
    if (invoice.projectId) revalidatePath(`/projects/${invoice.projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error in deleteInvoice:", error);
    return GlobalErrorService.handleError(error, "Action:deleteInvoice");
  }
}

export async function getInvoices(params?: {
  clientId?: string;
  projectId?: string;
  status?: InvoiceStatus;
  page?: number;
  limit?: number;
}) {
  try {
    return await FinanceService.getInvoices(params);
  } catch (error) {
    console.error("Error in getInvoices:", error);
    return GlobalErrorService.handleError(error, "Action:getInvoices");
  }
}

export async function getInvoice(id: string) {
  try {
    return await FinanceService.getInvoice(id);
  } catch (error) {
    console.error("Error in getInvoice:", error);
    return GlobalErrorService.handleError(error, "Action:getInvoice");
  }
}

export async function updateOverdueInvoices() {
  try {
    await FinanceService.updateOverdueInvoices();
    return { success: true };
  } catch (error) {
    console.error("Error in updateOverdueInvoices:", error);
    return GlobalErrorService.handleError(error, "Action:updateOverdueInvoices");
  }
}

export type InvoiceWithRelations = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
