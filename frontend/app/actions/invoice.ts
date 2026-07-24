"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, InvoiceStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { NumberGenerator } from "@/lib/finance/number-generator.service";
import { syncProjectFinancials } from "./project";

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
  return NumberGenerator.generateInvoiceNumber();
}

export async function createInvoice(data: CreateInvoiceData) {
  try {
    const invoiceNum = data.invoiceNumber || await NumberGenerator.generateInvoiceNumber();
    
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceNum,
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
        items: data.items ? {
          create: data.items,
        } : undefined,
      },
      include: {
        items: true
      }
    });

    if (data.projectId) {
      await syncProjectFinancials(data.projectId);
    }
    
    EventBus.publish(WorkflowEvent.INVOICE_CREATED, {
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
    
    if (data.items) {
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });
    }

    const updateData: Prisma.InvoiceUpdateInput = {
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      notes: data.notes,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      client: data.clientId ? { connect: { id: data.clientId } } : undefined,
    };

    if (data.items) {
      updateData.items = {
        create: data.items
      };
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    // Check if project changed, sync both
    if (existingInvoice.projectId && existingInvoice.projectId !== data.projectId) {
      await syncProjectFinancials(existingInvoice.projectId);
    }
    if (invoice.projectId) {
      await syncProjectFinancials(invoice.projectId);
    }

    if (existingInvoice.status !== 'SENT' && invoice.status === 'SENT') {
      EventBus.publish(WorkflowEvent.INVOICE_SENT, {
        invoiceId: invoice.id,
        projectId: invoice.projectId,
        clientId: invoice.clientId,
      });
    }

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

    EventBus.publish(WorkflowEvent.TASK_COMPLETED, {
      taskId: "invoice_deleted",
      userId: invoice.clientId
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
          payments: true,
          items: true
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
        },
        items: true
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
