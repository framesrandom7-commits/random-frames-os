"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HardDrive, ExternalLink } from "lucide-react";
import { createProjectDriveFolder } from "@/app/actions/integrations";
import { toast } from "sonner";

interface ProjectDriveButtonProps {
  projectId: string;
  driveRootFolderId?: string | null;
  driveRootFolderUrl?: string | null;
}

export default function ProjectDriveButton({ projectId, driveRootFolderId, driveRootFolderUrl }: ProjectDriveButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async () => {
    setLoading(true);
    const result = await createProjectDriveFolder(projectId);
    setLoading(false);
    
    if (result.success) {
      toast.success("Google Drive folder structure created automatically!");
    } else {
      toast.error(result.error);
    }
  };

  if (driveRootFolderUrl) {
    return (
      <a href={driveRootFolderUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="border-white/10 text-white bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 gap-2">
          <HardDrive className="w-4 h-4" />
          Open Drive Folder
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
      className="border-white/10 text-white bg-white/5 hover:bg-white/10 gap-2"
    >
      <HardDrive className="w-4 h-4 text-yellow-400" />
      {loading ? "Creating Folders..." : "Create Drive Folder"}
    </Button>
  );
}
