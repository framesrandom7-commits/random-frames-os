"use client";

import React, { useState } from "react";
import { useUpload } from "./upload-provider";
import { X, Minus, UploadCloud, CheckCircle2, AlertCircle, File as FileIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function GlobalUploadCenter() {
  const { uploads, isCenterOpen, setCenterOpen, clearCompleted, removeUpload } = useUpload();
  const [minimized, setMinimized] = useState(false);

  if (!isCenterOpen && uploads.length === 0) return null;
  if (!isCenterOpen) return null;

  const totalUploads = uploads.length;
  const completedUploads = uploads.filter(u => u.status === 'completed').length;
  const isAllComplete = totalUploads > 0 && completedUploads === totalUploads;
  const hasErrors = uploads.some(u => u.status === 'error');

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (minimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={() => setMinimized(false)}
      >
        <UploadCloud className="h-5 w-5 text-blue-400" />
        <div className="text-sm font-medium text-white">
          {isAllComplete ? 'Uploads Complete' : `Uploading ${totalUploads - completedUploads} files...`}
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full text-zinc-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setCenterOpen(false); }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          {isAllComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : hasErrors ? (
            <AlertCircle className="h-5 w-5 text-red-400" />
          ) : (
            <UploadCloud className="h-5 w-5 text-blue-400 animate-pulse" />
          )}
          <span className="font-semibold text-white">
            {isAllComplete ? 'Uploads Complete' : `Uploading ${totalUploads - completedUploads} files...`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-zinc-400 hover:text-white" onClick={() => setMinimized(true)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-zinc-400 hover:text-white" onClick={() => setCenterOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="h-72 w-full p-4">
        <div className="flex flex-col gap-3">
          {uploads.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm py-8">No active uploads</div>
          ) : (
            uploads.map((upload) => (
              <div key={upload.id} className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col gap-2 relative group">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <FileIcon className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{upload.file.name}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-400 mt-1">
                      <span>{formatBytes(upload.bytesUploaded)} / {formatBytes(upload.totalBytes)}</span>
                      <span>{upload.progress}%</span>
                    </div>
                  </div>
                </div>
                
                <Progress 
                  value={upload.progress} 
                  className={`h-1.5 bg-white/5 ${
                    upload.status === 'completed' ? 'indicator-emerald' :
                    upload.status === 'error' ? 'indicator-red' : 'indicator-blue'
                  }`}
                />
                
                {upload.status === 'error' && (
                  <p className="text-xs text-red-400 truncate">{upload.error}</p>
                )}

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50"
                  onClick={() => removeUpload(upload.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {completedUploads > 0 && (
        <div className="p-3 border-t border-white/10 bg-white/5 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white" onClick={clearCompleted}>
            Clear Completed
          </Button>
        </div>
      )}
    </div>
  );
}
