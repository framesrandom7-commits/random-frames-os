"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = ".pdf,.docx,.jpg,.jpeg,.png",
  maxSize = 10,
  maxFiles = 5,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter((file) => {
      // Very basic validation
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is ${maxSize}MB.`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);
    
    // Mocking an upload delay
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onUpload(updatedFiles);
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [files, maxSize, maxFiles]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const updated = files.filter((_, index) => index !== indexToRemove);
    setFiles(updated);
    onUpload(updated);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors bg-white/5",
          dragActive ? "border-[#C1121F] bg-[#C1121F]/10" : "border-white/10 hover:border-white/20",
          uploading && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          disabled={uploading}
        />
        
        {uploading ? (
          <Loader2 className="w-10 h-10 text-[#C1121F] animate-spin mb-4" />
        ) : (
          <UploadCloud className="w-10 h-10 text-zinc-400 mb-4" />
        )}
        
        <p className="text-sm font-medium text-white text-center">
          {uploading ? "Uploading files..." : "Drag & drop files here, or click to select files"}
        </p>
        <p className="text-xs text-zinc-500 text-center mt-2">
          Supported formats: PDF, DOCX, JPG, PNG (Max {maxSize}MB per file)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 rounded-md bg-zinc-900 border border-white/10">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon className="w-5 h-5 text-zinc-400 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm text-white truncate">{file.name}</span>
                  <span className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
