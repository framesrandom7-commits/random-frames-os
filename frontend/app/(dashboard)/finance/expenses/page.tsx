import React from "react";
import { getExpenses } from "@/app/actions/expense";
import ExpensesTable from "@/components/finance/expenses-table";
import { ExpenseCategory } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: {
    category?: ExpenseCategory;
    month?: string;
    year?: string;
    page?: string;
  };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const month = searchParams.month ? parseInt(searchParams.month) : undefined;
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  
  const expensesResponse = await getExpenses({
    category: searchParams.category,
    month,
    year,
    page,
    limit: 50
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ExpensesTable data={expensesResponse} />
    </div>
  );
}
