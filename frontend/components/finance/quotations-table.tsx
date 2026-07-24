"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Trash2, Copy, FileText } from "lucide-react";
import Link from "next/link";
import { Prisma, QuotationStatus } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createQuotation } from "@/app/actions/quotation";
import { NumberGenerator } from "@/lib/finance/number-generator.service";

type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: { client: true; project: true; items: true }
}>;

interface QuotationsTableProps {
  data: {
    quotations: QuotationWithRelations[];
    total: number;
    totalPages: number;
    page: number;
  };
  clients: { id: string; businessName: string }[];
}

export default function QuotationsTable({ data, clients }: QuotationsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "SENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DRAFT": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "EXPIRED": return "bg-zinc-800 text-zinc-500 border-zinc-700";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentStatus = searchParams.get("status");

  const handleCreateNew = async () => {
    if (clients.length === 0) {
      alert("Please create a client first before creating a quotation.");
      return;
    }
    const result = await createQuotation({
      issueDate: new Date(),
      validUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      subtotal: 0,
      total: 0,
      status: "DRAFT",
      clientId: clients[0].id,
      projectId: "", // Needs to be handled properly in the edit form
      items: []
    });
    if (result.success && result.quotation) {
      router.push(`/finance/quotations/${result.quotation.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
          <Badge 
            variant="outline" 
            className={`cursor-pointer whitespace-nowrap ${!currentStatus ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
            onClick={() => setFilter("status", null)}
          >
            All
          </Badge>
          {Object.values(QuotationStatus).map(status => (
            <Badge 
              key={status}
              variant="outline" 
              className={`cursor-pointer whitespace-nowrap ${currentStatus === status ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
              onClick={() => setFilter("status", status)}
            >
              {status}
            </Badge>
          ))}
        </div>
        
        <Button 
          onClick={handleCreateNew}
          className="bg-[#C1121F] hover:bg-[#a00f1a] text-white whitespace-nowrap w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Quotation
        </Button>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Quotation</TableHead>
                <TableHead className="text-zinc-400 font-medium hidden md:table-cell">Client</TableHead>
                <TableHead className="text-zinc-400 font-medium hidden lg:table-cell">Project</TableHead>
                <TableHead className="text-zinc-400 font-medium">Amount</TableHead>
                <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.quotations.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                    No quotations found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.quotations.map((quotation) => (
                  <TableRow key={quotation.id} className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer group">
                    <TableCell onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <div className="flex flex-col">
                        <span className="font-medium text-white group-hover:text-white transition-colors">{quotation.quotationNumber}</span>
                        <span className="text-xs text-zinc-500">{new Date(quotation.issueDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell" onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <span className="text-zinc-300">{quotation.client?.businessName || "Unknown Client"}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell" onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <span className="text-zinc-400 max-w-[200px] truncate block">{quotation.project?.title || "No Project"}</span>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <span className="font-medium text-white">{formatCurrency(Number(quotation.total))}</span>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <Badge variant="outline" className={getStatusColor(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          <DropdownMenuItem asChild className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <Link href={`/finance/quotations/${quotation.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View & Edit
                            </Link>
                          </DropdownMenuItem>
                          {/* More actions can go here */}
                        </DropdownMenuContent>
                      </DropdownMenu>
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
