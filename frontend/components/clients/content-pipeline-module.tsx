"use client";

import React, { useState, useTransition } from "react";
import { ModuleDetailsSection } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Film, Image as ImageIcon, ExternalLink, Plus, Loader2, CheckCircle2, CircleDashed, Trash2 } from "lucide-react";
import { ClientContentDeliverable, ContentFormat, ContentPipelineStatus } from "@prisma/client";
import { createContentDeliverable, updateContentDeliverableStatus, deleteContentDeliverable } from "@/app/actions/content-pipeline";
import { toast } from "sonner";

interface ContentPipelineModuleProps {
  clientId: string;
  deliverables: ClientContentDeliverable[];
}

export function ContentPipelineModule({ clientId, deliverables }: ContentPipelineModuleProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [format, setFormat] = useState<ContentFormat>("REEL_VIDEO");
  const [driveLink, setDriveLink] = useState("");

  const handleCreateDeliverable = () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await createContentDeliverable({
        clientId,
        title,
        format,
        driveLink
      });

      if (result.success) {
        toast.success("Deliverable added to pipeline");
        setIsDialogOpen(false);
        setTitle("");
        setFormat("REEL_VIDEO");
        setDriveLink("");
      } else {
        toast.error("Failed to add deliverable");
      }
    });
  };

  const updateStatus = (id: string, newStatus: ContentPipelineStatus) => {
    startTransition(async () => {
      const result = await updateContentDeliverableStatus(id, clientId, newStatus);
      if (result.success) {
        toast.success(`Moved to ${newStatus}`);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return;
    startTransition(async () => {
      await deleteContentDeliverable(id, clientId);
      toast.success("Deleted from pipeline");
    });
  };

  const renderPipelineStages = (deliverable: ClientContentDeliverable) => {
    const stages: { status: ContentPipelineStatus; label: string }[] = [
      { status: "EDITING", label: "Editing" },
      { status: "UPLOADED", label: "Uploaded" },
      { status: "SHARED", label: "Shared" },
      { status: "REVISION_REQUESTED", label: "Revise" },
      { status: "APPROVED", label: "Approved" }
    ];

    const currentStageIndex = stages.findIndex(s => s.status === deliverable.status);

    return (
      <div className="relative flex items-center justify-between w-full mt-6 mb-2">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-px bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
        />

        {stages.map((stage, idx) => {
          const isPassed = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          
          return (
            <div key={stage.status} className="relative z-10 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => updateStatus(deliverable.id, stage.status)}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isPassed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-[#18181B] border-2 border-white/20 group-hover:border-white/50'}`}>
                {isPassed && <div className="w-1.5 h-1.5 rounded-full bg-[#09090b]" />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${isCurrent ? 'text-emerald-400' : isPassed ? 'text-emerald-500/70' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const reels = deliverables.filter(d => d.format === "REEL_VIDEO");
  const photos = deliverables.filter(d => d.format === "PHOTO_BATCH");

  const Section = ({ title, count, items, icon: Icon }: { title: string, count: number, items: ClientContentDeliverable[], icon: any }) => (
    <div className="bg-[#09090b] rounded-xl p-6 border border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-400" />
          {title}
        </h3>
        <div className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
          {count} Active
        </div>
      </div>
      
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4 italic">No items in pipeline.</p>
        ) : (
          items.map(item => (
            <div key={item.id} className="p-5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group relative">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">{item.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {item.driveLink && (
                    <a href={item.driveLink} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="Open Drive Link">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="text-zinc-500 hover:text-rose-400 transition-colors ml-2" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {renderPipelineStages(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ModuleDetailsSection>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-zinc-400" />
            Content Delivery Pipeline
          </h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-white/10 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add to Pipeline</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label>Asset Title</Label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Summer Campaign Reel 1" 
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={format} onValueChange={(val: ContentFormat) => setFormat(val)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#09090b] border-white/10 text-white">
                      <SelectItem value="REEL_VIDEO">Reel / Video</SelectItem>
                      <SelectItem value="PHOTO_BATCH">Photo Batch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Google Drive Link (Optional)</Label>
                  <Input 
                    value={driveLink} 
                    onChange={e => setDriveLink(e.target.value)} 
                    placeholder="https://drive.google.com/..." 
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                <Button onClick={handleCreateDeliverable} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add to Pipeline
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Reels & Videos" count={reels.length} items={reels} icon={Film} />
          <Section title="Photo Assets" count={photos.length} items={photos} icon={ImageIcon} />
        </div>
      </ModuleDetailsSection>
    </div>
  );
}
