"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, HardDrive, Link as LinkIcon, UploadCloud, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDriveFolderContents } from "@/app/actions/drive";
import { useUpload } from "@/components/storage/uploads/upload-provider";

export default function ProjectStorageTab({ project }: { project: any }) {
  const { addUploads } = useUpload();
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContents() {
      if (!project.driveRootFolderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getDriveFolderContents(project.driveRootFolderId);
        if (res.success) {
          setFiles(res.files || []);
        } else {
          setError(res.error || "Failed to load folders");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContents();
  }, [project.driveRootFolderId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && project.driveRootFolderId) {
      addUploads(Array.from(e.target.files), project.driveRootFolderId);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Root Folder ID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-mono truncate">{project.driveRootFolderId || 'Unassigned'}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Folder Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-emerald-400 font-medium">Optimal</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center">
          <CardContent className="pt-6 w-full">
             <input type="file" id="upload-file" multiple className="hidden" onChange={handleFileUpload} />
             <Button onClick={() => document.getElementById('upload-file')?.click()} className="w-full bg-[#C1121F] hover:bg-[#a00f1a] text-white">
                <UploadCloud className="h-4 w-4 mr-2" />
                Upload to Project
             </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-md">
        <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Project Folders</CardTitle>
          {project.driveRootFolderUrl && (
            <Button asChild variant="outline" size="sm" className="h-8 border-white/10 text-white">
              <a href={project.driveRootFolderUrl} target="_blank" rel="noopener noreferrer">
                <LinkIcon className="h-4 w-4 mr-2" /> Open in Drive
              </a>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-zinc-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading folders...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12 text-red-400">
              <AlertCircle className="h-5 w-5 mr-2" /> {error}
            </div>
          ) : !project.driveRootFolderId ? (
            <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
              <HardDrive className="h-8 w-8 mb-3 opacity-20" />
              <p>No storage folder assigned</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {files.map((file) => (
                <a 
                  key={file.id} 
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-blue-400" />
                    <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{file.name}</span>
                  </div>
                  <span className="text-xs text-zinc-500">{new Date(file.createdTime).toLocaleDateString()}</span>
                </a>
              ))}
              {files.length === 0 && (
                <div className="p-8 text-center text-zinc-500 text-sm">Folder is empty</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
