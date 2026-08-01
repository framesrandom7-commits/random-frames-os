"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HardDrive, ExternalLink } from "lucide-react";
import { toast } from "sonner";
// We will create this server action next
import { createClientDriveFolder } from "@/app/actions/integrations";

interface ClientDriveButtonProps {
  clientId: string;
  driveFolderId?: string | null;
  driveFolderUrl?: string | null;
}

export default function ClientDriveButton({ clientId, driveFolderId, driveFolderUrl }: ClientDriveButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async () => {
    setLoading(true);
    const result = await createClientDriveFolder(clientId);
    setLoading(false);
    
    if (result.success) {
      toast.success("Google Drive folder structure queued for creation!");
    } else {
      toast.error(result.error || "Failed to create folders");
    }
  };

  if (driveFolderUrl) {
    return (
      <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer" className="w-full">
        <Button variant="outline" className="w-full border-white/10 text-white bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 gap-2">
          <HardDrive className="w-4 h-4" />
          Open Client Drive Folder
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </a>
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleCreateFolder} 
      disabled={loading}
      className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10 gap-2"
    >
      <HardDrive className="w-4 h-4 text-yellow-400" />
      {loading ? "Creating Folders..." : "Create Drive Folder"}
    </Button>
  );
}
