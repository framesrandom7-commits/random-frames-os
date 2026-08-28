import React from "react";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Briefcase, Camera, User, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProjectFinancePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const resolvedParams = await params;

  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.projectId },
    include: {
      client: true,
      shoots: {
        include: {
          expenses: {
            include: { category: true }
          }
        },
        orderBy: { date: 'desc' }
      },
      expenses: {
        where: { shootId: null },
        include: { category: true },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!project) {
    return (
      <div className="h-full flex flex-col p-8 items-center justify-center text-zinc-500">
        <h2 className="text-xl font-bold mb-2 text-white">Project Not Found</h2>
        <p>The requested project could not be found.</p>
        <Link href="/finance/expenses" className="mt-4 text-[#C1121F] hover:underline">
          Return to Expenses
        </Link>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  // Calculate totals
  const shootTotal = project.shoots.reduce((acc, shoot) => 
    acc + shoot.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)
  , 0);
  const overheadTotal = project.expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
  const grandTotal = shootTotal + overheadTotal;

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/finance/expenses" className="text-zinc-400 hover:text-white flex items-center gap-2 mb-3 text-sm transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" /> Back to Expenses
          </Link>
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-[#C1121F]" />
            <h1 className="text-3xl font-bold text-white">{project.title}</h1>
            <Badge variant="outline" className="ml-2 bg-zinc-800 text-zinc-300 border-zinc-700">
              {project.status}
            </Badge>
          </div>
        </div>

        {/* Client Info Card */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md flex items-center gap-4 min-w-[250px]">
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <User className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">Client Details</p>
            <p className="font-semibold text-white">{project.client?.businessName || "No Client Assigned"}</p>
            {project.client?.contactName && (
              <p className="text-sm text-zinc-500">{project.client.contactName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar space-y-6 pr-2">
        {/* Project Overheads / Non-Shoot Expenses */}
        {project.expenses.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-md overflow-hidden">
            <div className="bg-black/40 p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-zinc-400" /> General Project Expenses
              </h3>
              <p className="font-bold text-red-400">{formatCurrency(overheadTotal)}</p>
            </div>
            <div className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400 w-[120px]">Date</TableHead>
                    <TableHead className="text-zinc-400">Title</TableHead>
                    <TableHead className="text-zinc-400">Category</TableHead>
                    <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.expenses.map(exp => (
                    <TableRow key={exp.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-zinc-400 text-sm">{new Date(exp.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-white font-medium">{exp.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400">
                          {exp.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-red-400 font-medium">{formatCurrency(Number(exp.amount))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Shoots */}
        <h2 className="text-xl font-bold text-white pt-4 border-t border-white/10">Shoots & Production Costs</h2>
        
        {project.shoots.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center text-zinc-500">
            No shoots have been created for this project yet.
          </div>
        ) : (
          <div className="grid gap-6">
            {project.shoots.map(shoot => {
              const shootCost = shoot.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
              
              return (
                <div key={shoot.id} className="bg-white/5 border border-white/10 rounded-lg backdrop-blur-md overflow-hidden">
                  <div className="bg-black/60 p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Camera className="h-5 w-5 text-emerald-400" />
                        <h3 className="font-semibold text-lg text-white">{shoot.title}</h3>
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-700 text-zinc-300 ml-2">
                          {shoot.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(shoot.date).toLocaleDateString()}</span>
                        <span>Code: {shoot.shootCode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Shoot Cost</p>
                      <p className="font-bold text-red-400 text-lg">{formatCurrency(shootCost)}</p>
                    </div>
                  </div>
                  
                  <div className="p-0">
                    <Table>
                      <TableHeader className="bg-black/20">
                        <TableRow className="border-white/10 hover:bg-transparent">
                          <TableHead className="text-zinc-400 w-[120px]">Date</TableHead>
                          <TableHead className="text-zinc-400">Expense Title</TableHead>
                          <TableHead className="text-zinc-400">Category</TableHead>
                          <TableHead className="text-zinc-400 text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shoot.expenses.length === 0 ? (
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableCell colSpan={4} className="h-20 text-center text-zinc-500">
                              No expenses recorded for this shoot.
                            </TableCell>
                          </TableRow>
                        ) : (
                          shoot.expenses.map(exp => (
                            <TableRow key={exp.id} className="border-white/10 hover:bg-white/5 transition-colors">
                              <TableCell className="text-zinc-400 text-sm">{new Date(exp.date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-white font-medium">{exp.title}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-400">
                                  {exp.category.name}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right text-red-400 font-medium">{formatCurrency(Number(exp.amount))}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
