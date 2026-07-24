import React from "react";
import { getExpenses } from "@/app/actions/expense";
import { prisma } from "@/lib/prisma";
import ExpensesTable from "@/components/finance/expenses-table";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoryId?: string;
    month?: string;
    year?: string;
    page?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;
  const month = resolvedParams.month ? parseInt(resolvedParams.month) : undefined;
  const year = resolvedParams.year ? parseInt(resolvedParams.year) : undefined;
  
  const [expensesResponse, categories] = await Promise.all([
    getExpenses({
      categoryId: resolvedParams.categoryId,
      month,
      year,
      page,
      limit: 50
    }),
    prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ExpensesTable data={expensesResponse} categories={categories} />
    </div>
  );
}
