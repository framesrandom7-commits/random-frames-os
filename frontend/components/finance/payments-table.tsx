"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CurrencyService } from "@/lib/finance/currency.service";

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

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Table Area */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Payment Ref</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Date</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Client / Project</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Related Doc</TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Method</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right whitespace-nowrap">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-zinc-700 mb-4" />
                      <p>No payments found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.payments.map((payment) => (
                  <TableRow key={payment.id} className="border-white/5 hover:bg-white/5 transition-colors cursor-default">
                    <TableCell className="font-medium text-white whitespace-nowrap">
                      {payment.referenceNumber || "—"}
                    </TableCell>
                    <TableCell className="text-zinc-300 whitespace-nowrap">
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
                    <TableCell className="text-right">
                      <div className="font-bold text-emerald-400">
                        {formatCurrency(Number(payment.amount))}
                      </div>
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
