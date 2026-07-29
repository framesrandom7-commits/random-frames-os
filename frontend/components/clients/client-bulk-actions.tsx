"use client";

import React, { useTransition } from "react";
import { ModuleBulkActions } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteClient } from "@/app/actions/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ClientBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function ClientBulkActions({ selectedIds, onClearSelection }: ClientBulkActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} clients?`)) {
      startTransition(async () => {
        let successCount = 0;
        for (const id of selectedIds) {
          const success = await deleteClient(id);
          if (success) successCount++;
        }
        
        if (successCount > 0) {
          toast.success(`Deleted ${successCount} clients`);
          onClearSelection();
          router.refresh();
        } else {
          toast.error("Failed to delete clients");
        }
      });
    }
  };

  const actions = (
    <>
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
