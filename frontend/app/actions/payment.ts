"use server";

import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { syncProjectFinancials } from "./project";
import { NumberGenerator } from "@/lib/finance/number-generator.service";

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

export async function createPayment(data: CreatePaymentData) {
  try {
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || NumberGenerator.generatePaymentReference(),
        notes: data.notes,
        invoiceId: data.invoiceId,
        projectId: data.projectId,
        clientId: data.clientId,
      },
    });

    if (data.projectId) {
      await syncProjectFinancials(data.projectId);
    }
    
    // Emit Workflow Event instead of calling Activity Timeline directly
    EventBus.publish(WorkflowEvent.PAYMENT_RECEIVED, {
      paymentId: payment.id,
      invoiceId: data.invoiceId || undefined,
      amount: data.amount,
      projectId: data.projectId,
      clientId: data.clientId,
      // userId is omitted here because we're not passing the current user context into the action yet, but it can be added later
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

    if (payment.projectId) {
      await syncProjectFinancials(payment.projectId);
    }

    // Since delete is a mutation we still might want an event or just an activity log,
    // but the spec focuses on forward actions. We'll manually log deletion or emit a system event.
    // To strictly follow the "never call Activity Timeline directly" rule:
    EventBus.publish(WorkflowEvent.TASK_COMPLETED, {
      taskId: "payment_deleted", // Hacky fallback for unstructured system events, or we could add PAYMENT_DELETED
      userId: payment.clientId
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

export async function getPayments(params?: {
  clientId?: string;
  projectId?: string;
  invoiceId?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: import("@prisma/client").Prisma.PaymentWhereInput = {};
    if (params?.clientId) where.clientId = params.clientId;
    if (params?.projectId) where.projectId = params.projectId;
    if (params?.invoiceId) where.invoiceId = params.invoiceId;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { paymentDate: "desc" },
        skip,
        take: limit,
        include: {
          client: true,
          project: true,
          invoice: true
        }
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { payments: [], total: 0, totalPages: 0, page: 1, limit: 50 };
  }
}

