"use client";

import React, { useState } from "react";
import { ModuleDataView, ModuleViewSwitcher } from "@/components/ui/module";
import { LeadListWithRelations, softDeleteLead, restoreLead } from "@/app/actions/lead";
import { useLeadColumns } from "./lead-columns";
import { LeadBulkActions } from "./lead-bulk-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import LeadForm from "./lead-form";

export interface LeadViewManagerProps {
  leads: LeadListWithRelations[];
  isArchived: boolean;
  total: number;
}

export function LeadViewManager({ leads, isArchived, total }: LeadViewManagerProps) {
  const router = useRouter();
  const [editingLead, setEditingLead] = useState<LeadListWithRelations | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);

  const handleEdit = (lead: LeadListWithRelations) => {
    setEditingLead(lead);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      const success = await softDeleteLead(id);
      if (success) {
        toast.success("Lead deleted");
        router.refresh();
      } else {
        toast.error("Failed to delete lead");
      }
    }
  };

  const handleRestore = async (id: string) => {
    const success = await restoreLead(id);
    if (success) {
      toast.success("Lead restored");
      router.refresh();
    } else {
      toast.error("Failed to restore lead");
    }
  };

  const { columns, cardRender } = useLeadColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onRestore: handleRestore,
    isArchived
  });

  return (
    <>
      <ModuleDataView
        data={leads}
        columns={columns}
        cardRender={cardRender}
        getRowId={(row) => row.id}
        isEmpty={leads.length === 0}
        pagination={{ totalCount: total }}
        bulkActions={(selectedIds, onClearSelection) => (
          <LeadBulkActions selectedIds={selectedIds} onClearSelection={onClearSelection} />
        )}
        onRowClick={(lead) => router.push(`/leads/${lead.id}`)}
      />

      <LeadForm 
        open={formOpen} 
        onOpenChange={(val) => {
          setFormOpen(val);
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
