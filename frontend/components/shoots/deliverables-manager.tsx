"use client";

import React, { useState, useTransition, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Loader2, Link as LinkIcon, FileUp, FileText, CheckCircle2, MoreVertical, Edit2 } from "lucide-react";
import { createDeliverable, updateDeliverable, addDeliverableFile, addDeliverableVersion, deleteDeliverable, getDeliverablesByShoot, deleteDeliverableFile } from "@/app/actions/deliverable";
import { toast } from "sonner";
import { DeliverableStatus, ReviewStatus, DeliverablePriority } from "@prisma/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function DeliverablesManager({ shootId }: { shootId: string }) {
  const [isPending, startTransition] = useTransition();
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [newType, setNewType] = useState("");
  const [newEditor, setNewEditor] = useState("");
  
  const loadDeliverables = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDeliverablesByShoot(shootId);
      setDeliverables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load deliverables:", error);
      toast.error("Failed to load deliverables");
      setDeliverables([]);
    } finally {
      setIsLoading(false);
    }
  }, [shootId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDeliverables();
  }, [loadDeliverables]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newType.trim()) return;

    startTransition(async () => {
      const result = await createDeliverable({
        shootId,
        type: newType.trim(),
        assignedEditor: newEditor.trim() || null,
        status: "PENDING",
        priority: "MEDIUM"
      });
      if (result.success) {
        setNewType("");
        setNewEditor("");
        setIsAdding(false);
        loadDeliverables();
        toast.success("Deliverable added");
      } else {
        toast.error("Failed to add deliverable");
      }
    });
  };

  const handleStatusChange = (id: string, status: DeliverableStatus) => {
    startTransition(async () => {
      const result = await updateDeliverable(id, { status });
      if (result.success) {
        loadDeliverables();
        toast.success("Status updated");
      }
    });
  };
  
  const handleReviewStatusChange = (id: string, reviewStatus: ReviewStatus) => {
    startTransition(async () => {
      const result = await updateDeliverable(id, { reviewStatus, reviewDate: new Date() });
      if (result.success) {
        loadDeliverables();
        toast.success("Review status updated");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return;
    startTransition(async () => {
      const result = await deleteDeliverable(id);
      if (result.success) {
        loadDeliverables();
        toast.success("Deliverable deleted");
      }
    });
  };

  const handleAddFile = (id: string) => {
    const url = prompt("Enter file URL (e.g., Google Drive link):");
    if (!url) return;
    
    startTransition(async () => {
      const result = await addDeliverableFile({
        deliverableId: id,
        name: "Download Link",
        url
      });
      if (result.success) {
        loadDeliverables();
        toast.success("File added");
      }
    });
  };

  const handleAddVersion = (id: string) => {
    const changeNotes = prompt("Enter change notes for this version:");
    if (!changeNotes) return;
    
    startTransition(async () => {
      const result = await addDeliverableVersion({
        deliverableId: id,
        changeNotes
      });
      if (result.success) {
        loadDeliverables();
        toast.success("Version added");
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      case 'EDITING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'READY_FOR_REVIEW': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'CHANGES_REQUESTED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'DELIVERED': return 'bg-emerald-600/20 text-emerald-500 border-emerald-600/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };
  
  const getReviewColor = (status: string) => {
    switch (status) {
      case 'NOT_SENT': return 'text-zinc-500';
      case 'UNDER_REVIEW': return 'text-blue-400';
      case 'CHANGES_REQUESTED': return 'text-amber-400';
      case 'APPROVED': return 'text-emerald-400';
      default: return 'text-zinc-500';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-500" /></div>;
  }

  return (
    <div className="space-y-4">
      {deliverables.length === 0 && !isAdding ? (
        <div className="text-center py-8 bg-zinc-900/30 rounded-lg border border-white/5 border-dashed">
          <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm mb-4">No deliverables created yet.</p>
          <Button onClick={() => setIsAdding(true)} variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white">
            <Plus className="w-4 h-4 mr-2" /> Add First Deliverable
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map((item) => (
            <div key={item.id} className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{item.type}</h4>
                      {item.versions && item.versions.length > 0 && (
                        <Badge variant="outline" className="bg-white/5 text-xs text-zinc-400">
                          v{item.versions[0].versionNumber}
                        </Badge>
                      )}
                    </div>
                    {item.assignedEditor && (
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        Editor: <span className="text-zinc-300">{item.assignedEditor}</span>
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none">
                        <Badge variant="outline" className={`cursor-pointer border ${getStatusColor(item.status)}`}>
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white">
                        {Object.values(DeliverableStatus).map(status => (
                          <DropdownMenuItem key={status} onClick={() => handleStatusChange(item.id, status)} className="hover:bg-white/10 cursor-pointer">
                            {status.replace(/_/g, " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 focus:outline-none">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white w-48">
                        <DropdownMenuItem onClick={() => handleAddFile(item.id)} className="hover:bg-white/10 cursor-pointer">
                          <FileUp className="w-4 h-4 mr-2" /> Add Link/File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddVersion(item.id)} className="hover:bg-white/10 cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" /> New Version
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="hover:bg-red-500/20 text-red-400 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Review Status & Files */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">Client Review:</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="focus:outline-none hover:opacity-80 transition-opacity">
                        <span className={`font-medium flex items-center gap-1 ${getReviewColor(item.reviewStatus)}`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.reviewStatus.replace(/_/g, " ")}
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-900 border-white/10 text-white">
                        {Object.values(ReviewStatus).map(status => (
                          <DropdownMenuItem key={status} onClick={() => handleReviewStatusChange(item.id, status)} className="hover:bg-white/10 cursor-pointer">
                            {status.replace(/_/g, " ")}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {item.files && item.files.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">Files:</span>
                      {item.files.map((file: any) => (
                        <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded transition-colors">
                          <LinkIcon className="w-3 h-3" />
                          {file.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Version History snippet */}
                {item.versions && item.versions.length > 1 && (
                  <div className="text-xs text-zinc-500 mt-2 p-2 bg-black/20 rounded border border-white/5">
                    <span className="font-medium text-zinc-400">Previous Versions: </span>
                    {item.versions.slice(1).map((v: any) => `v${v.versionNumber}`).join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAdding && (
            <form onSubmit={handleAdd} className="bg-zinc-900/50 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Deliverable Type (e.g. Wedding Teaser)"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="bg-black/50 border-white/10 text-white h-9"
                  disabled={isPending}
                  autoFocus
                />
                <Input
                  placeholder="Assigned Editor (Optional)"
                  value={newEditor}
                  onChange={(e) => setNewEditor(e.target.value)}
                  className="bg-black/50 border-white/10 text-white h-9"
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAdding(false)} 
                  disabled={isPending}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={isPending || !newType.trim()}
                  className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Deliverable
                </Button>
              </div>
            </form>
          )}

          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full bg-white/5 border-white/10 border-dashed hover:bg-white/10 text-white mt-2">
              <Plus className="w-4 h-4 mr-2" /> Add Deliverable
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
