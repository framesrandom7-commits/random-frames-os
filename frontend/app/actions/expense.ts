"use server";

import { prisma } from "@/lib/prisma";
import { ExpenseCategory, PaymentMethod, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CreateExpenseData = {
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  vendor?: string;
  notes?: string;
};

export async function createExpense(data: CreateExpenseData) {
  try {
    const expense = await prisma.expense.create({
      data: {
        title: data.title,
        category: data.category,
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod,
        vendor: data.vendor,
        notes: data.notes,
      },
    });

    revalidatePath("/finance/expenses");
    revalidatePath("/finance");
    return { success: true, expense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/finance/expenses");
    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}

export async function getExpenses(params?: {
  category?: ExpenseCategory;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}) {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {};
    
    if (params?.category) {
      where.category = params.category;
    }
    
    if (params?.month && params?.year) {
      const startDate = new Date(params.year, params.month - 1, 1);
      const endDate = new Date(params.year, params.month, 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return {
      expenses,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit
    };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { expenses: [], total: 0, totalPages: 0, page: 1, limit: 50 };
  }
}
