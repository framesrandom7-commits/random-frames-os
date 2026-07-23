"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ExternalLink, MoreVertical, Trash2, Copy, FileText, MessageCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Prisma, InvoiceStatus } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteInvoice, generateInvoiceNumber, createInvoice } from "@/app/actions/invoice";
import { whatsappLinks } from "@/lib/integrations/whatsapp";

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: { client: true; project: true; payments: true }
}>;

interface InvoicesTableProps {
  data: {
    invoices: InvoiceWithRelations[];
    total: number;
    totalPages: number;
    page: number;
  };
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function InvoicesTable({ data, clients, projects }: InvoicesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case "PAID": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "OVERDUE": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "PARTIAL": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "SENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DRAFT": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "CANCELLED": return "bg-zinc-800 text-zinc-500 border-zinc-700";
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      setIsDeleting(id);
      await deleteInvoice(id);
      setIsDeleting(null);
    }
  };

  const handleDuplicate = async (invoice: InvoiceWithRelations) => {
    const newNumber = await generateInvoiceNumber();
    const result = await createInvoice({
      invoiceNumber: newNumber,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)), // +15 days default
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      status: "DRAFT",
      notes: invoice.notes || undefined,
      projectId: invoice.projectId,
      clientId: invoice.clientId,
    });
    if (result.success && result.invoice) {
      router.push(`/finance/invoices/${result.invoice.id}`);
    }
  };

  const handleCreateNew = async () => {
    // Basic creation that routes to the edit page
    if (clients.length === 0) {
      alert("Please create a client first before creating an invoice.");
      return;
    }
    const newNumber = await generateInvoiceNumber();
    const result = await createInvoice({
      invoiceNumber: newNumber,
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
      subtotal: 0,
      total: 0,
      status: "DRAFT",
      clientId: clients[0].id,
      projectId: "", // Will fail if not provided, UI should handle this but for draft we provide empty string
    });
    if (result.success && result.invoice) {
      router.push(`/finance/invoices/${result.invoice.id}`);
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
          {Object.values(InvoiceStatus).map(status => (
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
          <Plus className="h-4 w-4 mr-2" /> Create Invoice
        </Button>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-hidden bg-white/5 border border-white/10 rounded-lg flex flex-col backdrop-blur-md">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <Table>
            <TableHeader className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium">Invoice</TableHead>
                <TableHead className="text-zinc-400 font-medium">Client / Project</TableHead>
                <TableHead className="text-zinc-400 font-medium">Issue Date</TableHead>
                <TableHead className="text-zinc-400 font-medium">Due Date</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right">Amount</TableHead>
                <TableHead className="text-zinc-400 font-medium">Status</TableHead>
                <TableHead className="text-zinc-400 font-medium w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invoices.length === 0 ? (
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                    No invoices found. Create your first invoice!
                  </TableCell>
                </TableRow>
              ) : (
                data.invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                    <TableCell>
                      <Link href={`/finance/invoices/${invoice.id}`} className="font-medium text-white hover:text-[#C1121F] transition-colors flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-zinc-500 group-hover:text-[#C1121F] transition-colors" />
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-zinc-200">{invoice.client.businessName}</div>
                      {invoice.project && (
                        <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">
                          {invoice.project.title}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-medium text-white">
                      {formatCurrency(Number(invoice.total))}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-md">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-zinc-200">
                          <DropdownMenuItem className="p-0 hover:bg-white/10 hover:text-white cursor-pointer">
                            <Link href={`/finance/invoices/${invoice.id}`} className="flex items-center w-full px-2 py-1.5">
                              <ExternalLink className="h-4 w-4 mr-2" /> View & Edit
                            </Link>
                          </DropdownMenuItem>
                          
                          {invoice.client?.phone && (
                            <DropdownMenuItem className="p-0 hover:bg-white/10 hover:text-white cursor-pointer">
                              <a 
                                href={whatsappLinks.sendInvoice(
                                  invoice.client.phone, 
                                  invoice.client.contactPerson || invoice.client.businessName, 
                                  invoice.invoiceNumber,
                                  Number(invoice.total),
                                  `https://randomframes.app/invoice/${invoice.id}`
                                )} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center w-full px-2 py-1.5 text-emerald-400"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" /> Send WhatsApp
                              </a>
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(invoice)}
                            className="hover:bg-white/10 hover:text-white cursor-pointer"
                          >
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(invoice.id)}
                            disabled={isDeleting === invoice.id}
                            className="text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> {isDeleting === invoice.id ? 'Deleting...' : 'Delete'}
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
