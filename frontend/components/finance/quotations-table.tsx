"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, Trash2, Copy, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Prisma, QuotationStatus } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { createQuotation, deleteQuotation, deleteMultipleQuotations } from "@/app/actions/quotation";
import { Checkbox } from "@/components/ui/checkbox";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { getQuotationStatusMetadata } from "@/domain/finance/metadata";
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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.quotations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.quotations.map(q => q.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} quotations?`)) {
      setIsDeletingBulk(true);
      await deleteMultipleQuotations(selectedIds);
      setSelectedIds([]);
      setIsDeletingBulk(false);
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
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4 mr-2" /> 
              {isDeletingBulk ? 'Deleting...' : `Delete (${selectedIds.length})`}
            </Button>
          )}
          <Button 
            onClick={handleCreateNew}
            className="bg-[#C1121F] hover:bg-[#a00f1a] text-white whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Quotation
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[40px] pl-4">
                  <Checkbox 
                    checked={selectedIds.length === data.quotations.length && data.quotations.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                    className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                  />
                </TableHead>
                <TableHead className="text-zinc-400 font-medium">Quotation</TableHead>
                <TableHead className="text-zinc-400 font-medium hidden md:table-cell">Client</TableHead>
                <TableHead className="text-zinc-400 font-medium">Amount</TableHead>
                <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.quotations.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                    No quotations found matching the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.quotations.map((quotation) => (
                  <TableRow key={quotation.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                    <TableCell className="pl-4">
                      <Checkbox 
                        checked={selectedIds.includes(quotation.id)}
                        onChange={() => toggleSelect(quotation.id)}
                        aria-label={`Select quotation ${quotation.quotationNumber}`}
                        className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                      />
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-zinc-500 group-hover:text-[#C1121F] transition-colors" />
                          <span className="font-medium text-white group-hover:text-[#C1121F] transition-colors">{quotation.quotationNumber}</span>
                        </div>
                        <span className="text-xs text-zinc-500">{new Date(quotation.issueDate).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell" onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <span className="text-zinc-300">{quotation.client?.businessName || "Unknown Client"}</span>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      <span className="font-medium text-white">{formatCurrency(Number(quotation.total))}</span>
                    </TableCell>
                    <TableCell onClick={() => router.push(`/finance/quotations/${quotation.id}`)}>
                      {(() => {
                        const meta = getQuotationStatusMetadata(quotation.status);
                        return (
                          <Badge variant={meta?.variant || "outline"} className={meta?.color}>
                            {meta?.label || quotation.status}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-white/10 inline-flex items-center justify-center rounded-md">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          <DropdownMenuItem onSelect={() => router.push(`/finance/quotations/${quotation.id}`)} className="hover:bg-zinc-800 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <FileText className="mr-2 h-4 w-4" />
                            View & Edit
                          </DropdownMenuItem>

                          <div className="h-px bg-white/10 my-1 mx-2" />
                          
                          <DropdownMenuItem className="p-0 hover:bg-white/10 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white">
                            <a href={`/api/documents/quotation/${quotation.id}`} target="_blank" className="flex items-center w-full px-2 py-1.5 text-blue-400 hover:text-blue-300">
                              <FileText className="h-4 w-4 mr-2" /> Download Quotation
                            </a>
                          </DropdownMenuItem>

                          {quotation.client?.phone && (
                            <DropdownMenuItem className="p-0 hover:bg-white/10 hover:text-white cursor-pointer focus:bg-zinc-800 focus:text-white">
                              <a 
                                href={whatsappLinks.sendQuotation(
                                  quotation.client.phone, 
                                  quotation.client.contactPerson || quotation.client.businessName, 
                                  Number(quotation.total),
                                  `https://randomframes.app/api/documents/quotation/${quotation.id}/pdf`
                                )} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center w-full px-2 py-1.5 text-emerald-400 hover:text-emerald-300"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" /> Send WhatsApp
                              </a>
                            </DropdownMenuItem>
                          )}

                          <div className="h-px bg-white/10 my-1 mx-2" />

                          <DropdownMenuItem 
                            onSelect={async (e) => {
                              e.preventDefault();
                              if (confirm("Are you sure you want to delete this quotation?")) {
                                await deleteQuotation(quotation.id);
                              }
                            }}
                            className="text-red-400 focus:text-red-300 focus:bg-red-400/10 hover:text-red-300 hover:bg-red-400/10 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Quotation
                          </DropdownMenuItem>
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
