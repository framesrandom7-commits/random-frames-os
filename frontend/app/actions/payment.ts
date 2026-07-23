"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CreatePaymentData = {
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  invoiceId?: string;
  projectId: string;
  clientId: string;
};

export type UpdatePaymentData = Partial<CreatePaymentData>;

// Keep the invoice status in sync with payments
async function syncInvoiceStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true }
  });
  
  if (!invoice) return;
  
  const totalPaid = invoice.payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
  const total = Number(invoice.total);
  
  let newStatus = invoice.status;
  
  // Don't auto-update if cancelled
  if (newStatus !== "CANCELLED") {
    if (totalPaid >= total && total > 0) {
      newStatus = "PAID";
    } else if (totalPaid > 0 && totalPaid < total) {
      newStatus = "PARTIAL";
    } else if (totalPaid === 0 && invoice.dueDate < new Date()) {
      newStatus = "OVERDUE";
    } else if (totalPaid === 0 && newStatus === "PARTIAL") {
      newStatus = "SENT";
    }
  }
  
  if (newStatus !== invoice.status) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus }
    });
  }
}

import { syncProjectFinancials } from "./project";

export async function createPayment(data: CreatePaymentData) {
  try {
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
        invoiceId: data.invoiceId,
        projectId: data.projectId,
        clientId: data.clientId,
      },
    });

    if (data.invoiceId) {
      await syncInvoiceStatus(data.invoiceId);
    }
    if (data.projectId) {
      await syncProjectFinancials(data.projectId);
    }
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Payment of ${data.amount} received`,
      paymentId: payment.id,
      invoiceId: data.invoiceId,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    revalidatePath("/finance");
    revalidatePath("/finance/invoices");
    if (data.invoiceId) revalidatePath(`/finance/invoices/${data.invoiceId}`);
    revalidatePath(`/clients/${data.clientId}`);
    if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
    
    return { success: true, payment };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: "Failed to create payment" };
  }
}

export async function deletePayment(id: string) {
  try {
    const payment = await prisma.payment.delete({
      where: { id },
    });

    if (payment.invoiceId) {
      await syncInvoiceStatus(payment.invoiceId);
    }
    if (payment.projectId) {
      await syncProjectFinancials(payment.projectId);
    }
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Payment of ${payment.amount} deleted`,
      invoiceId: payment.invoiceId || undefined,
      projectId: payment.projectId,
      clientId: payment.clientId,
    });

    revalidatePath("/finance");
    revalidatePath("/finance/invoices");
    if (payment.invoiceId) revalidatePath(`/finance/invoices/${payment.invoiceId}`);
    revalidatePath(`/clients/${payment.clientId}`);
    if (payment.projectId) revalidatePath(`/projects/${payment.projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: "Failed to delete payment" };
  }
}
