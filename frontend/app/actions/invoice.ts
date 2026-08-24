"use server";

import { InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FinanceService } from "@/domain/services/FinanceService";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { checkFinanceRbac } from "./rbac";
import { FinanceRbacEngine } from "@/domain/finance/finance-rbac";
import { prisma } from "@/lib/prisma";

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
    const user = await checkFinanceRbac();

    // Recalculate totals
    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = subtotal - discount + tax;

    if (discount > 0 && !FinanceRbacEngine.canApproveDiscount(user.role?.name, discount)) {
      throw new Error("403 Forbidden: Discount amount exceeds Co-Founder limit.");
    }

    const payload = {
      ...data,
      subtotal,
      discount,
      tax,
      total,
    };

    const invoice = await FinanceService.createInvoice(payload);
    
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
    const user = await checkFinanceRbac();

    if (data.discount !== undefined && data.discount > 0 && !FinanceRbacEngine.canApproveDiscount(user.role?.name, data.discount)) {
      throw new Error("403 Forbidden: Discount amount exceeds Co-Founder limit.");
    }

    let updatePayload = { ...data };
    if (data.items) {
      const subtotal = data.items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
      const discount = data.discount ?? 0;
      const tax = data.tax ?? 0;
      updatePayload.subtotal = subtotal;
      updatePayload.total = subtotal - discount + tax;
    } else if (data.subtotal !== undefined) {
      throw new Error("Cannot update subtotal directly without items.");
    }

    const invoice = await FinanceService.updateInvoice(id, updatePayload);
    
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
    const user = await checkFinanceRbac();
    if (!FinanceRbacEngine.canDeleteFinancialRecord(user.role?.name)) {
      throw new Error("403 Forbidden: Only Founders can delete financial records.");
    }

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

export async function convertQuotationToInvoice(quotationId: string) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: { items: true }
    });

    if (!quotation) {
      throw new Error("Quotation not found");
    }

    const items = quotation.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
    }));

    let pId = quotation.projectId;
    if (!pId) {
      const fallbackProject = await prisma.project.findFirst({ where: { clientId: quotation.clientId } }) || await prisma.project.findFirst();
      if (!fallbackProject) throw new Error("No projects exist to link the invoice to. Please create a project first.");
      pId = fallbackProject.id;
    }

    const invoice = await FinanceService.createInvoice({
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 days due
      subtotal: Number(quotation.subtotal),
      discount: Number(quotation.discount || 0),
      tax: Number(quotation.tax || 0),
      total: Number(quotation.total),
      status: "DRAFT",
      notes: quotation.notes || undefined,
      projectId: pId,
      clientId: quotation.clientId,
      items: items
    });

    if (quotation.status !== "APPROVED") {
      await FinanceService.updateQuotation(quotationId, { status: "APPROVED" });
    }

    revalidatePath("/finance/invoices");
    revalidatePath("/finance/quotations");
    if (quotation.projectId) revalidatePath(`/projects/${quotation.projectId}`);

    return { success: true, invoice };
  } catch (error) {
    console.error("Error converting quotation to invoice:", error);
    return GlobalErrorService.handleError(error, "Action:convertQuotationToInvoice");
  }
}

export type InvoiceWithRelations = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
