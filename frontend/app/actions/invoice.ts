"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { syncProjectFinancials } from "./project";

export type CreateInvoiceData = {
  invoiceNumber: string;
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
};

export type UpdateInvoiceData = Partial<CreateInvoiceData>;

// Helper to generate a unique invoice number
export async function generateInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seq = (count + 1).toString().padStart(4, '0');
  return `INV-${year}${month}-${seq}`;
}

export async function createInvoice(data: CreateInvoiceData) {
  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        total: data.total,
        status: data.status || "DRAFT",
        notes: data.notes,
        projectId: data.projectId,
        clientId: data.clientId,
      },
    });

    if (data.projectId) {
      await syncProjectFinancials(data.projectId);
    }
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Invoice ${invoice.invoiceNumber} created (${invoice.total})`,
      invoiceId: invoice.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    revalidatePath("/finance/invoices");
    revalidatePath(`/clients/${data.clientId}`);
    if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
    
    return { success: true, invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function updateInvoice(id: string, data: UpdateInvoiceData) {
  try {
    const existingInvoice = await prisma.invoice.findUnique({ where: { id } });
    if (!existingInvoice) throw new Error("Invoice not found");
    
    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        discount: data.discount,
        tax: data.tax,
        total: data.total,
        status: data.status,
        notes: data.notes,
        projectId: data.projectId,
        clientId: data.clientId,
      },
    });

    // Check if project changed, sync both
    if (existingInvoice.projectId && existingInvoice.projectId !== data.projectId) {
      await syncProjectFinancials(existingInvoice.projectId);
    }
    if (invoice.projectId) {
      await syncProjectFinancials(invoice.projectId);
    }
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "STATUS_CHANGE",
      description: `Invoice ${invoice.invoiceNumber} updated (Status: ${invoice.status})`,
      invoiceId: invoice.id,
      projectId: invoice.projectId,
      clientId: invoice.clientId,
    });

    revalidatePath("/finance/invoices");
    revalidatePath(`/finance/invoices/${id}`);
    revalidatePath(`/clients/${invoice.clientId}`);
    if (invoice.projectId) revalidatePath(`/projects/${invoice.projectId}`);
    
    return { success: true, invoice };
  } catch (error) {
    console.error("Error updating invoice:", error);
    return { success: false, error: "Failed to update invoice" };
  }
}

export async function deleteInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.delete({
      where: { id },
    });

    if (invoice.projectId) {
      await syncProjectFinancials(invoice.projectId);
    }
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Invoice ${invoice.invoiceNumber} deleted`,
      projectId: invoice.projectId,
      clientId: invoice.clientId,
    });

    revalidatePath("/finance/invoices");
    revalidatePath(`/clients/${invoice.clientId}`);
    if (invoice.projectId) revalidatePath(`/projects/${invoice.projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return { success: false, error: "Failed to delete invoice" };
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
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {};
    if (params?.clientId) where.clientId = params.clientId;
    if (params?.projectId) where.projectId = params.projectId;
    if (params?.status) where.status = params.status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { issueDate: "desc" },
        skip,
        take: limit,
        include: {
          client: true,
          project: true,
          payments: true
        }
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    };
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return { invoices: [], total: 0, totalPages: 0, page: 1, limit: 50 };
  }
}

export async function getInvoice(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });
    return invoice;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

// Function to handle automatic overdue status update
export async function updateOverdueInvoices() {
  try {
    const now = new Date();
    await prisma.invoice.updateMany({
      where: {
        dueDate: { lt: now },
        status: { in: ["DRAFT", "SENT", "PARTIAL"] }
      },
      data: {
        status: "OVERDUE"
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating overdue invoices:", error);
    return { success: false };
  }
}

export type InvoiceWithRelations = NonNullable<Awaited<ReturnType<typeof getInvoice>>>;
