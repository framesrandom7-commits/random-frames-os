"use client";

import React, { useRef, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, File, Loader2, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addLeadAttachment } from "@/app/actions/lead";
import { toast } from "sonner";

type Attachment = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: Date;
};

export default function AttachmentCard({ leadId, attachments }: { leadId: string; attachments: Attachment[] }) {
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to S3 or a storage provider here
    // For this demonstration, we'll mock the upload and save the metadata
    startTransition(async () => {
      // Mocking upload delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = await addLeadAttachment(
        leadId,
        file.name,
        URL.createObjectURL(file), // Mock URL
        file.size,
        file.type || "application/octet-stream"
      );

      if (success) {
        toast.success("Attachment added successfully");
      } else {
        toast.error("Failed to add attachment");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white text-lg">Attachments</CardTitle>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 bg-zinc-900 border-white/10 text-white"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Add File
        </Button>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 border border-dashed border-white/10 rounded-lg bg-black/20">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Plus className="w-6 h-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-white font-medium">Add Attachments</p>
              <p className="text-sm text-zinc-500 mt-1">Upload files, contracts, or reference images.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-black/20 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                    <File className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white text-sm font-medium truncate">{attachment.fileName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-zinc-500">{formatFileSize(attachment.fileSize)}</span>
                      <span className="text-xs text-zinc-600">•</span>
                      <span className="text-xs text-zinc-500">{new Date(attachment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={attachment.fileUrl} download={attachment.fileName} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Download">
                    <Download className="h-4 w-4" />
                  </a>
                  {/* Delete functionality could be added here in the future */}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
