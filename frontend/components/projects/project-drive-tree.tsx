"use client";

import React, { useState, useEffect } from "react";
import { Folder, HardDrive, RefreshCw, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { getClientDriveSyncStatus } from "@/app/actions/drive-status";
import { createProjectDriveFolder } from "@/app/actions/integrations";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ProjectDriveTreeProps {
  project: any;
}

export default function ProjectDriveTree({ project }: ProjectDriveTreeProps) {
  const [loading, setLoading] = useState(false);
  const [syncJob, setSyncJob] = useState<any>(null);

  useEffect(() => {
    // We can reuse the client drive sync status logic but for this project ID
    // Wait, getClientDriveSyncStatus takes a clientId, we should make getProjectDriveSyncStatus
    const fetchStatus = async () => {
      const { getProjectDriveSyncStatus } = await import("@/app/actions/drive-status");
      const job = await getProjectDriveSyncStatus(project.id);
      setSyncJob(job);
    };
    fetchStatus();
  }, [project.id]);

  const handleCreateFolder = async () => {
    setLoading(true);
    const result = await createProjectDriveFolder(project.id);
    
    if (result.success) {
      toast.success("Project folders queued for creation!");
      setTimeout(async () => {
        const { getProjectDriveSyncStatus } = await import("@/app/actions/drive-status");
        const job = await getProjectDriveSyncStatus(project.id);
        setSyncJob(job);
        setLoading(false);
      }, 2000);
    } else {
      toast.error(result.error || "Failed to queue project folders");
      setLoading(false);
    }
  };

  const hasRoot = !!project.driveRootFolderId;

  const renderFolderLink = (name: string, folderId: string | null | undefined, level: number = 0) => {
    if (!folderId) return null;
    return (
      <a 
        href={`https://drive.google.com/drive/folders/${folderId}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-2 py-1.5 px-3 rounded-md hover:bg-white/5 text-sm transition-colors text-zinc-300 hover:text-white ${level > 0 ? 'ml-6 border-l border-white/10' : ''}`}
      >
        <Folder className="w-4 h-4 text-blue-400" />
        {name}
        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
      </a>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center py-2 border-b border-white/5">
        <span className="text-zinc-400 text-sm">Structure Status</span>
        {hasRoot ? (
          <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            Provisioned
          </span>
        ) : syncJob?.status === "PENDING" || syncJob?.status === "PROCESSING" ? (
          <span className="flex items-center text-sm font-medium text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
            <RefreshCw size={14} className="mr-1.5 animate-spin" /> Syncing
          </span>
        ) : syncJob?.status === "FAILED" ? (
          <span className="flex items-center text-sm font-medium text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">
            <AlertCircle size={14} className="mr-1.5" /> Failed
          </span>
        ) : (
          <span className="flex items-center text-sm font-medium text-zinc-500 bg-zinc-500/10 px-3 py-1 rounded-full">
            Missing
          </span>
        )}
      </div>

      {!hasRoot ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-400">
            The Google Drive folder structure for this project has not been generated yet.
          </p>
          <Button 
            variant="outline" 
            onClick={handleCreateFolder} 
            disabled={loading || syncJob?.status === "PENDING" || syncJob?.status === "PROCESSING"}
            className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10 gap-2"
          >
            <HardDrive className="w-4 h-4 text-yellow-400" />
            {loading ? "Queuing..." : "Create Project Folders"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-1 mt-2 bg-black/20 p-4 rounded-lg border border-white/5">
          {renderFolderLink(project.title || "Project Root", project.driveRootFolderId)}
          
          <div className="flex flex-col mt-1">
            {renderFolderLink("RAW", project.rawFolderId, 1)}
            {renderFolderLink("Photos", project.editFolderId, 1)}
            {renderFolderLink("Reels", project.socialFolderId, 1)}
            {renderFolderLink("Final Delivery", project.deliveryFolderId, 1)}
            {renderFolderLink("Archive", project.backupFolderId, 1)}
          </div>
        </div>
      )}
      
      {syncJob && !hasRoot && (
        <div className="flex justify-between items-center py-2 border-t border-white/5 mt-2">
          <span className="text-zinc-500 text-xs flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Last attempt: {new Date(syncJob.updatedAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
