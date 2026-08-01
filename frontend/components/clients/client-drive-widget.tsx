"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HardDrive, ExternalLink, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { createClientDriveFolder } from "@/app/actions/integrations";
import { getClientDriveSyncStatus } from "@/app/actions/drive-status";

interface ClientDriveWidgetProps {
  clientId: string;
  driveFolderId?: string | null;
  driveFolderUrl?: string | null;
}

export default function ClientDriveWidget({ clientId, driveFolderId, driveFolderUrl }: ClientDriveWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [syncJob, setSyncJob] = useState<any>(null);

  useEffect(() => {
    // Fetch last sync job status
    getClientDriveSyncStatus(clientId).then(setSyncJob);
  }, [clientId]);

  const handleCreateFolder = async () => {
    setLoading(true);
    const result = await createClientDriveFolder(clientId);
    
    if (result.success) {
      toast.success("Sync queued successfully!");
      // Refresh status after 2 seconds
      setTimeout(() => {
        getClientDriveSyncStatus(clientId).then(setSyncJob);
        setLoading(false);
      }, 2000);
    } else {
      toast.error(result.error || "Failed to queue sync");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <span className="text-zinc-400 text-sm">Status</span>
          {driveFolderId ? (
            <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
              <CheckCircle2 size={14} className="mr-1.5" /> Provisioned
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
              <AlertCircle size={14} className="mr-1.5" /> Missing
            </span>
          )}
        </div>

        {syncJob && (
          <div className="flex justify-between items-center py-2 border-b border-white/5">
            <span className="text-zinc-400 text-sm">Last Sync</span>
            <span className="text-white text-sm flex items-center">
              <Clock className="w-3 h-3 mr-1 text-zinc-500" />
              {new Date(syncJob.updatedAt).toLocaleString()}
            </span>
          </div>
        )}
        
        {syncJob?.status === "FAILED" && syncJob.lastError && (
          <div className="flex flex-col py-2 border-b border-white/5">
            <span className="text-zinc-400 text-sm mb-1">Last Error</span>
            <span className="text-rose-500 text-xs bg-rose-500/10 p-2 rounded-md break-all">
              {syncJob.lastError}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {driveFolderUrl ? (
          <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" className="w-full border-white/10 text-white bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 gap-2">
              <HardDrive className="w-4 h-4" />
              Open Folder
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        ) : null}
        
        <Button 
          variant="outline" 
          onClick={handleCreateFolder} 
          disabled={loading || syncJob?.status === "PENDING" || syncJob?.status === "PROCESSING"}
          className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10 gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? "Queuing..." : driveFolderUrl ? "Force Sync Structure" : "Create Folders"}
        </Button>
      </div>
    </div>
  );
}
