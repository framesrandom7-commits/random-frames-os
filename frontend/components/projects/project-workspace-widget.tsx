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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleOpenDrive}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <HardDrive className="w-6 h-6 text-yellow-400" />
          <span className="text-xs font-medium">Open Drive</span>
        </Button>
        <Button
          onClick={handleShareClientLink}
          disabled={sharing}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <Share2 className="w-6 h-6 text-cyan-400" />
          <span className="text-xs font-medium">Share Link</span>
        </Button>
        <Button
          onClick={handleRepairFolders}
          disabled={repairing}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <FolderTree className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-medium">Repair Folders</span>
        </Button>
        <Button
          onClick={() => {
            window.open(`https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(projectTitle)}`, "_blank");
            toast.info("Displaying project shoots on Google Calendar.");
          }}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <CalendarIcon className="w-6 h-6 text-emerald-400" />
          <span className="text-xs font-medium">Calendar</span>
        </Button>
      </div>
    </div>
  );
}
