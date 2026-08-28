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
  
  const expensesResponse = await getExpenses({
    categoryId: resolvedParams.categoryId,
    month,
    year,
    page,
    limit: 50
  });
  const categories = await prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });

  if ('error' in expensesResponse) {
    return (
      <div className="h-full flex flex-col p-8 items-center justify-center text-red-500">
        <h2 className="text-xl font-bold mb-2">Error Loading Expenses</h2>
        <p>{expensesResponse.message || "An unknown error occurred."}</p>
        <p className="text-sm mt-4 text-zinc-400">If you recently updated the database schema, please restart your Next.js development server.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ExpensesTable data={expensesResponse as any} categories={categories} />
    </div>
  );
}
