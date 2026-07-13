"use client";

import React, { useState, useTransition } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "./status-badge";
import PriorityBadge from "./priority-badge";
import { Button } from "@/components/ui/button";
import { FilePlus, Edit, Trash2, ExternalLink, Star, ArrowUp, ArrowDown, RotateCcw, ChevronLeft, ChevronRight, MessageCircle, Eye } from "lucide-react";
import LeadForm from "./lead-form";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { softDeleteLead, restoreLead, bulkDeleteLeads, bulkUpdateLeadStatus, LeadListWithRelations } from "@/app/actions/lead";
import { toast } from "sonner";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatus } from "@prisma/client";

interface LeadTableProps {
  leads: LeadListWithRelations[];
  page?: number;
  totalPages?: number;
  total?: number;
}

export default function LeadTable({ leads, page = 1, totalPages = 1, total = 0 }: LeadTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<LeadListWithRelations | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isArchived = searchParams.get("archived") === "true";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const handleEdit = (e: React.MouseEvent, lead: LeadListWithRelations) => {
    e.stopPropagation();
    setEditingLead(lead);
    setOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this lead?")) {
      const success = await softDeleteLead(id);
      if (success) {
        toast.success("Lead deleted successfully");
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        toast.error("Failed to delete lead");
      }
    }
  };

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const success = await restoreLead(id);
    if (success) {
      toast.success("Lead restored successfully");
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      toast.error("Failed to restore lead");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} leads?`)) {
      const success = await bulkDeleteLeads(Array.from(selectedIds));
      if (success) {
        toast.success(`Deleted ${selectedIds.size} leads`);
        setSelectedIds(new Set());
      } else {
        toast.error("Failed to delete leads");
      }
    }
  };

  const handleBulkStatusUpdate = async (status: LeadStatus) => {
    if (selectedIds.size === 0) return;
    const success = await bulkUpdateLeadStatus(Array.from(selectedIds), status);
    if (success) {
      toast.success(`Updated status for ${selectedIds.size} leads`);
      setSelectedIds(new Set());
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/leads/${id}`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  if (leads.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10">
            <FilePlus className="h-10 w-10 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No leads found</h3>
          <p className="text-zinc-400 max-w-sm mb-8">
            {isArchived ? "There are no deleted leads." : "Get started by adding your first lead to track their journey through your pipeline."}
          </p>
          {!isArchived && (
            <Button onClick={() => { setEditingLead(undefined); setOpen(true); }} className="bg-[#C1121F] text-white hover:bg-[#a00f1a] px-8 h-11 shadow-lg">
              Add First Lead
            </Button>
          )}
          <LeadForm 
            open={open} 
            onOpenChange={(val) => {
              setOpen(val);
              if (!val) setEditingLead(undefined);
            }} 
            lead={editingLead ? {
              ...editingLead,
              tags: editingLead.leadTags?.map(lt => lt.tag.name) || [],
              budget: editingLead.budget ? Number(editingLead.budget) : null,
              reminderDate: editingLead.reminders && editingLead.reminders.length > 0 ? editingLead.reminders[0].date : null,
              reminderTime: editingLead.reminders && editingLead.reminders.length > 0 ? editingLead.reminders[0].time : null,
              reminderType: editingLead.reminders && editingLead.reminders.length > 0 ? editingLead.reminders[0].type : null,
            } as any : undefined}
          />
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
        {selectedIds.size > 0 && (
          <div className="absolute top-0 left-0 right-0 h-14 bg-[#1a1a1a] border-b border-white/10 z-10 flex items-center justify-between px-4 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#C1121F] text-white border-none">{selectedIds.size} selected</Badge>
              <span className="text-sm text-zinc-400">Choose bulk action:</span>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={(val) => handleBulkStatusUpdate(val as LeadStatus)}>
                <SelectTrigger className="h-8 w-[150px] bg-black/40 border-white/10 text-xs">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-white/10">
                  {Object.values(LeadStatus).map(status => (
                    <SelectItem key={status} value={status} className="text-white hover:bg-white/10">{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="h-8 text-xs bg-red-950/50 hover:bg-red-900 text-red-200 border border-red-900/50">
                <Trash2 className="h-3 w-3 mr-2" /> Delete
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[50px] pl-4">
                  <Checkbox 
                    checked={selectedIds.size === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                    className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                  />
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("businessName")}>
                  Business / Tags {renderSortIcon("businessName")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("contactPerson")}>
                  Contact {renderSortIcon("contactPerson")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("status")}>
                  Status {renderSortIcon("status")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("priority")}>
                  Priority {renderSortIcon("priority")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={() => handleSort("leadScore")}>
                  Score {renderSortIcon("leadScore")}
                </TableHead>
                <TableHead className="text-zinc-400 font-medium whitespace-nowrap">Reminder</TableHead>
                <TableHead className="text-zinc-400 font-medium text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={isPending ? "opacity-50 pointer-events-none" : ""}>
              {leads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className={`border-white/10 hover:bg-white/5 transition-colors cursor-pointer group ${selectedIds.has(lead.id) ? "bg-white/5" : ""}`}
                  onClick={() => handleRowClick(lead.id)}
                >
                  <TableCell className="pl-4" onClick={(e) => { e.stopPropagation(); toggleSelect(lead.id); }}>
                    <Checkbox 
                      checked={selectedIds.has(lead.id)}
                      onChange={() => toggleSelect(lead.id)}
                      className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:border-[#C1121F]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-white">{lead.businessName}</div>
                    {lead.leadTags && lead.leadTags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {lead.leadTags.slice(0, 2).map((lt) => (
                          <Badge key={lt.tag.id} variant="outline" className="text-[10px] py-0 border-white/20 text-zinc-300">
                            {lt.tag.name}
                          </Badge>
                        ))}
                        {lead.leadTags.length > 2 && <span className="text-xs text-zinc-500">+{lead.leadTags.length - 2}</span>}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-zinc-300 text-sm">{lead.contactPerson || "-"}</div>
                    <div className="text-zinc-500 text-xs">{lead.email || lead.phone}</div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={lead.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      {lead.leadScore}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {lead.reminders && lead.reminders.length > 0 ? (
                      <>
                        {new Date(lead.reminders[0].date).toLocaleDateString()}
                        {lead.reminders[0].time && <span className="text-xs ml-1 text-zinc-500">{lead.reminders[0].time}</span>}
                      </>
                    ) : "Not set"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {lead.phone && (
                        <a 
                          href={whatsappLinks.generalMessage(lead.phone, `Hi ${lead.contactPerson || lead.businessName},\n\n`)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10" title="WhatsApp">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRowClick(lead.id); }} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!isArchived && (
                        <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, lead)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {isArchived ? (
                        <Button variant="ghost" size="icon" onClick={(e) => handleRestore(e, lead.id)} className="h-8 w-8 text-zinc-400 hover:text-green-500 hover:bg-green-500/10" title="Restore">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, lead.id)} className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10" title="Delete">
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
        <div className="border-t border-white/10 p-4 flex items-center justify-between text-sm text-zinc-400 bg-black/20">
          <div>
            Showing <span className="text-white font-medium">{(page - 1) * 50 + 1}</span> to <span className="text-white font-medium">{Math.min(page * 50, total)}</span> of <span className="text-white font-medium">{total}</span> leads
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
      </Card>
      
      <LeadForm 
        open={open} 
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) setEditingLead(undefined);
        }} 
        lead={editingLead ? {
          ...editingLead,
          tags: editingLead.leadTags?.map(lt => lt.tag.name) || [],
          budget: editingLead.budget ? Number(editingLead.budget) : null,
          reminderDate: editingLead.reminders && editingLead.reminders.length > 0 ? editingLead.reminders[0].date : null,
          reminderTime: editingLead.reminders && editingLead.reminders.length > 0 ? editingLead.reminders[0].time : null,
          reminderType: editingLead.reminders && editingLead.reminders.length > 0 ? editingLead.reminders[0].type : null,
        } as any : undefined}
      />
    </>
  );
}
