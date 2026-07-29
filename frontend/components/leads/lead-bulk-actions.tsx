"use client";

import React, { useTransition } from "react";
import { ModuleBulkActions } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { LeadStatus } from "@prisma/client";
import { bulkDeleteLeads, bulkUpdateLeadStatus } from "@/app/actions/lead";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface LeadBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function LeadBulkActions({ selectedIds, onClearSelection }: LeadBulkActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
      startTransition(async () => {
        const success = await bulkDeleteLeads(selectedIds);
        if (success) {
          toast.success(`Deleted ${selectedIds.length} leads`);
          onClearSelection();
          router.refresh();
        } else {
          toast.error("Failed to delete leads");
        }
      });
    }
  };

  const handleBulkStatusUpdate = (status: LeadStatus) => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      const success = await bulkUpdateLeadStatus(selectedIds, status);
      if (success) {
        toast.success(`Updated status for ${selectedIds.length} leads`);
        onClearSelection();
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    });
  };

  const actions = (
    <>
      <Select onValueChange={(val) => handleBulkStatusUpdate(val as LeadStatus)} disabled={isPending}>
        <SelectTrigger className="h-8 w-[150px] bg-black/40 border-white/10 text-xs">
          <SelectValue placeholder="Update Status" />
        </SelectTrigger>
        <SelectContent className="bg-[#111] border-white/10">
          {Object.values(LeadStatus).map(status => (
            <SelectItem key={status} value={status} className="text-white hover:bg-white/10">{status.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        size="sm" 
        variant="destructive" 
        onClick={handleBulkDelete} 
        disabled={isPending}
        className="h-8 text-xs bg-red-950/50 hover:bg-red-900 text-red-200 border border-red-900/50"
      >
        <Trash2 className="h-3 w-3 mr-2" /> Delete
      </Button>
    </>
  );

  return (
    <ModuleBulkActions
      selectedCount={selectedIds.length}
      onClearSelection={onClearSelection}
      actions={actions}
    />
  );
}
