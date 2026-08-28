"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, MoreVertical, FileText, Trash2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { deletePayment, deleteMultiplePayments } from "@/app/actions/payment";
import { CurrencyService } from "@/lib/finance/currency.service";
import { Checkbox } from "@/components/ui/checkbox";
import { whatsappLinks } from "@/lib/integrations/whatsapp";

type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: { client: true; project: true; invoice: true }
}>;

interface PaymentsTableProps {
  data: {
    payments: PaymentWithRelations[];
    total: number;
    totalPages: number;
    page: number;
  };
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function PaymentsTable({ data, clients, projects }: PaymentsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const formatCurrency = (amount: number) => {
    return CurrencyService.format(amount);
  };

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.payments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.payments.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} payments?`)) {
      setIsDeletingBulk(true);
      await deleteMultiplePayments(selectedIds);
      setSelectedIds([]);
      setIsDeletingBulk(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment receipt?")) {
      setIsDeleting(id);
      await deletePayment(id);
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex justify-start bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-md">
          <Button 
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isDeletingBulk}
            className="whitespace-nowrap"
          >
            <Trash2 className="h-4 w-4 mr-2" /> 
            {isDeletingBulk ? 'Deleting...' : `Delete (${selectedIds.length})`}
          </Button>
        </div>
      )}

      {/* Table Area */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="w-[40px] pl-4">
                  <Checkbox 
                    checked={selectedIds.length === data.payments.length && data.payments.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                    className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                  />
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Ref Number</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Date</TableHead>
                <TableHead className="text-zinc-400 font-medium">Client / Project</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Related Invoice</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Method</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-zinc-700 mb-4" />
                      <p>No payments found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.payments.map((payment) => (
                  <TableRow key={payment.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                    <TableCell className="pl-4">
                      <Checkbox 
                        checked={selectedIds.includes(payment.id)}
                        onChange={() => toggleSelect(payment.id)}
                        aria-label={`Select payment ${payment.referenceNumber}`}
                        className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={`/finance/payments/${payment.id}`} className="font-medium text-white group-hover:text-[#C1121F] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
                        <FileText className="h-4 w-4 text-zinc-500 group-hover:text-[#C1121F] transition-colors" />
                        {payment.referenceNumber || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-zinc-300 whitespace-nowrap cursor-default">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link href={`/clients/${payment.clientId}`} className="text-sm font-medium text-white hover:text-[#C1121F] transition-colors flex items-center group">
                          {payment.client?.businessName || 'Unknown'}
                          <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        {payment.project && (
                          <Link href={`/projects/${payment.projectId}`} className="text-xs text-zinc-500 hover:text-white transition-colors line-clamp-1">
                            {payment.project.title}
                          </Link>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.invoice ? (
                        <Link href={`/finance/invoices/${payment.invoiceId}`} className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md hover:bg-blue-500/20 transition-colors inline-block">
                          Invoice {payment.invoice.invoiceNumber}
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-600">—</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 font-normal">
                        {payment.paymentMethod.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right cursor-default">
                      <div className="font-bold text-emerald-400">
                        {formatCurrency(Number(payment.amount))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:text-white">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-zinc-300">
                          <DropdownMenuItem className="p-0 hover:bg-white/10 hover:text-white cursor-pointer">
                            <a href={`/api/documents/receipt/${payment.id}/pdf`} target="_blank" className="flex items-center w-full px-2 py-1.5 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded">
                              <FileText className="h-4 w-4 mr-2" /> Download Receipt
                            </a>
                          </DropdownMenuItem>
                          
                          {payment.client?.phone && (
                            <DropdownMenuItem className="p-0 hover:bg-white/10 hover:text-white cursor-pointer">
                              <a 
                                href={whatsappLinks.sendReceipt(
                                  payment.client.phone, 
                                  payment.client.contactPerson || payment.client.businessName, 
                                  Number(payment.amount),
                                  `https://randomframes.app/api/documents/receipt/${payment.id}/pdf`
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
                            onClick={() => handleDelete(payment.id)}
                            disabled={isDeleting === payment.id}
                            className="text-red-400 focus:text-red-300 focus:bg-red-400/10 hover:text-red-300 hover:bg-red-400/10 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> {isDeleting === payment.id ? 'Deleting...' : 'Delete Receipt'}
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

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
            <span className="text-sm text-zinc-500">
              Showing page {data.page} of {data.totalPages}
            </span>
            <div className="flex gap-2">
              <Link
                href={`${pathname}?page=${data.page - 1}`}
                className={`px-3 py-1 text-sm rounded-md border ${data.page <= 1 ? 'border-white/5 text-zinc-600 pointer-events-none' : 'border-white/10 text-white hover:bg-white/10'}`}
              >
                Previous
              </Link>
              <Link
                href={`${pathname}?page=${data.page + 1}`}
                className={`px-3 py-1 text-sm rounded-md border ${data.page >= data.totalPages ? 'border-white/5 text-zinc-600 pointer-events-none' : 'border-white/10 text-white hover:bg-white/10'}`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
