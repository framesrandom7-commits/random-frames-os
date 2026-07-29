"use client";

import React, { useTransition } from "react";
import { ModuleBulkActions } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteProject } from "@/app/actions/project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface ProjectBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function ProjectBulkActions({ selectedIds, onClearSelection }: ProjectBulkActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} projects?`)) {
      startTransition(async () => {
        let successCount = 0;
        for (const id of selectedIds) {
          const success = await deleteProject(id);
          if (success) successCount++;
        }
        
        if (successCount > 0) {
          toast.success(`Deleted ${successCount} projects`);
          onClearSelection();
          router.refresh();
        } else {
          toast.error("Failed to delete projects");
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
