"use server";

import { PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { FinanceService } from "@/domain/services/FinanceService";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export type CreateExpenseData = {
  title: string;
  categoryId: string;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  clientId?: string;
  projectId: string;
  vendor?: string;
  receiptUrl?: string;
  notes?: string;
};

export async function createExpense(data: CreateExpenseData) {
  try {
    const expense = await FinanceService.createExpense(data);

    revalidatePath("/finance/expenses");
    revalidatePath("/finance");
    return { success: true, expense };
  } catch (error) {
    console.error("Error in createExpense:", error);
    return GlobalErrorService.handleError(error, "Action:createExpense");
  }
}

export async function deleteExpense(id: string) {
  try {
    await FinanceService.deleteExpense(id);

    revalidatePath("/finance/expenses");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    return GlobalErrorService.handleError(error, "Action:deleteExpense");
  }
}

export async function getExpenses(params?: {
  categoryId?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}) {
  try {
    return await FinanceService.getExpenses(params);
  } catch (error) {
    console.error("Error in getExpenses:", error);
    return GlobalErrorService.handleError(error, "Action:getExpenses");
  }
}
