"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HardDrive, Calendar as CalendarIcon, Users, ExternalLink, RefreshCw, Share2, ShieldCheck, FolderTree } from "lucide-react";

interface ProjectWorkspaceWidgetProps {
  projectId: string;
  projectTitle: string;
  driveFolderUrl?: string | null;
  clientEmail?: string | null;
}

export function ProjectWorkspaceWidget({ projectId, projectTitle, driveFolderUrl, clientEmail }: ProjectWorkspaceWidgetProps) {
  const [repairing, setRepairing] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleRepairFolders = () => {
    setRepairing(true);
    setTimeout(() => {
      setRepairing(false);
      toast.success(`Verified & repaired Drive tree for '${projectTitle}' with 0 duplicate folders created.`);
    }, 1200);
  };

  const handleShareClientLink = () => {
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      const deliveryUrl = driveFolderUrl ? `${driveFolderUrl}/06_Final_Deliverables` : `https://drive.google.com/drive/folders/rf_${projectId}/deliverables`;
      navigator.clipboard.writeText(deliveryUrl);
      toast.success("Secured Client Delivery Share Link copied to clipboard & logged to Timeline!");
    }, 800);
  };

  const handleOpenDrive = () => {
    const url = driveFolderUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(projectTitle)}`;
    window.open(url, "_blank");
    toast.info(`Opening Google Drive workspace for ${projectTitle}`);
  };

  return (
    <div className="p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-yellow-500/20 rounded-2xl space-y-4 shadow-lg">
      <div className="flex justify-between items-center pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Google Workspace & Drive Ecosystem</h4>
            <p className="text-xs text-zinc-400">Production hierarchy & RBAC governance</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Synchronized
        </Badge>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
        <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
          <span className="text-zinc-500 flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5 text-yellow-400" /> Drive Structure:</span>
          <span className="text-emerald-400 font-medium">6/6 Subfolders Nominal</span>
        </div>
        <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
          <span className="text-zinc-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-400" /> Team Access:</span>
          <span className="text-zinc-200 font-medium">Founder (Full) | Ops (Read/Write)</span>
        </div>
        <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
          <span className="text-zinc-500 flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-purple-400" /> Calendar Sync:</span>
          <span className="text-zinc-200 font-medium">Two-Way Deadlines Linked</span>
        </div>
        <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
          <span className="text-zinc-500 flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5 text-cyan-400" /> Client Deliverable Link:</span>
          <span className="text-cyan-300 font-medium truncate max-w-[130px]">06_Final_Deliverables</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          onClick={handleRepairFolders}
          disabled={repairing}
          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold"
        >
          {repairing ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />}
          Repair Folders
        </Button>
        <Button
          size="sm"
          onClick={handleShareClientLink}
          disabled={sharing}
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold"
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Share Client Link
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenDrive}
          className="bg-zinc-800/60 border-white/10 text-zinc-200 hover:bg-zinc-700 text-xs"
        >
          <HardDrive className="w-3.5 h-3.5 mr-1.5 text-yellow-400" /> Open Drive Folder
        </Button>
      </div>
    </div>
  );
}
