"use client";

import React, { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilePlus, Edit, Trash2, ExternalLink, ArrowUp, ArrowDown, RotateCcw, ChevronLeft, ChevronRight, Mail, Phone, MessageCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Client } from "@prisma/client";
import { deleteClient } from "@/app/actions/client";
import ClientForm from "./client-form";
import AddClientButton from "./add-client-button";
import { whatsappLinks } from "@/lib/integrations/whatsapp";

interface ClientTableProps {
  clients: Client[];
  page?: number;
  totalPages?: number;
  total?: number;
}

export default function ClientTable({ clients, page = 1, totalPages = 1, total = 0 }: ClientTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);

  const isArchived = searchParams.get("archived") === "true";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const handleEdit = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
    setOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to archive this client?")) {
      startTransition(async () => {
        const success = await deleteClient(id);
        if (success) {
          toast.success("Client archived successfully");
        } else {
          toast.error("Failed to archive client");
        }
      });
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/clients/${id}`);
  };

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const handleSort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === "asc" ? "desc" : "asc";
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", column);
      params.set("sortOrder", newOrder);
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("page", newPage.toString())}`);
    });
  };

  if (clients.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
            <FilePlus className="h-10 w-10 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No clients found</h3>
          <p className="text-zinc-400 max-w-sm mb-8">
            {isArchived ? "There are no archived clients." : "Get started by adding your first client."}
          </p>
          {!isArchived && (
            <AddClientButton label="Add First Client" className="px-8 h-11" />
          )}
          <ClientForm open={open} onOpenChange={setOpen} client={editingClient} />
        </CardContent>
      </Card>
    );
  }

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? <ArrowUp className="ml-1 h-3 w-3 inline" /> : <ArrowDown className="ml-1 h-3 w-3 inline" />;
  };

  return (
    <>
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("clientCode")}>
                  Code {renderSortIcon("clientCode")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("businessName")}>
                  Business Name {renderSortIcon("businessName")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("contactPerson")}>
                  Contact Person {renderSortIcon("contactPerson")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("businessType")}>
                  Type {renderSortIcon("businessType")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={isPending ? "opacity-50 pointer-events-none" : ""}>
              {clients.map((client) => (
                <TableRow 
                  key={client.id} 
                  className="border-white/10 hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => handleRowClick(client.id)}
                >
                  <TableCell>
                    <span className="font-mono text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded">{client.clientCode}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white">{client.businessName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-zinc-300 text-sm">{client.contactPerson || "-"}</div>
                    <div className="flex items-center gap-3 mt-1">
                      {client.email && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Mail className="w-3 h-3 mr-1" /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Phone className="w-3 h-3 mr-1" /> {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-zinc-400 capitalize bg-white/5 px-2 py-1 rounded">
                      {client.businessType.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {client.phone && (
                        <a 
                          href={whatsappLinks.generalMessage(client.phone, `Hi ${client.contactPerson || client.businessName},\n\n`)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10" title="WhatsApp">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRowClick(client.id); }} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!isArchived && (
                        <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, client)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {!isArchived && (
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, client.id)} className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-white/10 p-4 flex items-center justify-between text-sm text-zinc-400 bg-black/20">
            <div>
              Showing <span className="text-white font-medium">{(page - 1) * 50 + 1}</span> to <span className="text-white font-medium">{Math.min(page * 50, total)}</span> of <span className="text-white font-medium">{total}</span> clients
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page <= 1 || isPending}
                className="h-8 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-400"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <div className="px-2 text-white text-xs font-medium bg-white/10 rounded h-8 flex items-center">
                {page} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page >= totalPages || isPending}
                className="h-8 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white text-zinc-400"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      <ClientForm open={open} onOpenChange={setOpen} client={editingClient} />
    </>
  );
}
