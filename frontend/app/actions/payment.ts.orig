"use server";

import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FinanceService } from "@/domain/services/FinanceService";
import { checkFinanceRbac } from "./rbac";
import { FinanceRbacEngine } from "@/domain/finance/finance-rbac";

export type CreatePaymentData = {
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  upiTransactionId?: string;
  bankReference?: string;
  paymentScreenshotUrl?: string;
  notes?: string;
  invoiceId?: string;
  projectId: string;
  clientId: string;
};

export type UpdatePaymentData = Partial<CreatePaymentData>;

export async function createPayment(data: CreatePaymentData) {
  try {
    const user = await checkFinanceRbac();
    const payment = await FinanceService.createPayment(data);
    
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
    const user = await checkFinanceRbac();
    if (!FinanceRbacEngine.canDeleteFinancialRecord(user.role?.name)) {
      throw new Error("403 Forbidden: Only Founders can delete financial records.");
    }

    const payment = await FinanceService.deletePayment(id);

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
    return await FinanceService.getPayments(params);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { payments: [], total: 0, totalPages: 0, page: 1, limit: 50 };
  }
}
