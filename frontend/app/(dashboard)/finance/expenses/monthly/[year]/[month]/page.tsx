import React from "react";
import { getExpenses } from "@/app/actions/expense";
import { ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MonthlyProjectsPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>;
}) {
  const resolvedParams = await params;
  const year = parseInt(resolvedParams.year);
  const month = parseInt(resolvedParams.month);

  const expensesResponse = await getExpenses({ month, year, limit: 1000 });

  if ('error' in expensesResponse) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Error loading data.
      </div>
    );
  }

  // Filter for production expenses (those with shootId) and group by Project
  const projectsData: Record<string, { project: any, client: any, total: number }> = {};
  
  expensesResponse.expenses.forEach((expense: any) => {
    if (expense.shootId && expense.projectId && expense.project) {
      if (!projectsData[expense.projectId]) {
        projectsData[expense.projectId] = {
          project: expense.project,
          client: expense.client,
          total: 0
        };
      }
      projectsData[expense.projectId].total += Number(expense.amount);
    }
  });

  const displayProjects = Object.values(projectsData).sort((a, b) => b.total - a.total);
  const dateStr = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/finance/expenses" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-2 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Expenses
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-[#C1121F]" />
            Production Costs: {dateStr}
          </h1>
          <p className="text-zinc-400 mt-1">Select a project to view detailed shoot expenses</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Project Name</TableHead>
                <TableHead className="text-zinc-400 font-medium">Client</TableHead>
                <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Total Production Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProjects.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                    No production projects found for this month.
                  </TableCell>
                </TableRow>
              ) : (
                displayProjects.map((row) => (
                  <TableRow key={row.project.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <Link href={`/finance/projects/${row.project.id}`} className="flex items-center gap-2 font-medium text-white group-hover:text-[#C1121F] transition-colors">
                        {row.project.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-white">{row.client?.businessName || "No Client"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                        {row.project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-400">
                      {formatCurrency(row.total)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
