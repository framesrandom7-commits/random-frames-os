"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, ExternalLink, Image as ImageIcon, Film, Music, FileText } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface MediaPreviewProps {
  file: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaPreview({ file, isOpen, onClose }: MediaPreviewProps) {
  if (!file) return null;

  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isPdf = file.mimeType === 'application/pdf';

  // Fallback to webViewLink if we cannot embed directly.
  // Google Drive provides a webContentLink for direct download, and webViewLink for viewing.
  // For images, webContentLink can sometimes be used in an <img> tag if permissions allow.
  const previewUrl = file.webContentLink || file.webViewLink;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl w-[90vw] h-[85vh] p-0 bg-black border-white/10 flex flex-col gap-0 overflow-hidden shadow-2xl">
        <DialogTitle className="sr-only">Preview {file.name}</DialogTitle>
        {/* Header bar */}
        <div className="flex items-center justify-between p-3 bg-zinc-950/80 backdrop-blur-md border-b border-white/10 shrink-0 z-10">
          <div className="flex items-center gap-3">
            {isImage ? <ImageIcon className="h-5 w-5 text-blue-400" /> :
             isVideo ? <Film className="h-5 w-5 text-purple-400" /> :
             isAudio ? <Music className="h-5 w-5 text-amber-400" /> :
             <FileText className="h-5 w-5 text-red-400" />}
            <span className="text-sm font-medium text-white truncate max-w-md">{file.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <a href={file.webContentLink} download={file.name} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" }) + " h-8 text-zinc-400 hover:text-white bg-white/5"}>
              <Download className="h-4 w-4 mr-1.5" /> Download
            </a>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-zinc-400 hover:text-white hover:bg-white/10" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden relative">
          {isImage ? (
            <img 
              src={previewUrl} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Fallback to iframe if direct image link fails due to CORS/auth
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'block';
                }
              }}
            />
          ) : isVideo ? (
            <video controls className="max-w-full max-h-full" src={previewUrl}>
              Your browser does not support the video tag.
            </video>
          ) : isAudio ? (
            <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-900 gap-8">
               <Music className="h-32 w-32 text-zinc-800" />
               <audio controls className="w-96" src={previewUrl}>
                 Your browser does not support the audio element.
               </audio>
            </div>
          ) : null}

          {/* Fallback iframe for un-renderable or failed direct links (like PDFs or cors-blocked images) */}
          {(!isImage && !isVideo && !isAudio) && (
            <iframe 
              src={file.webViewLink.replace('/view', '/preview')} 
              className="w-full h-full border-0 bg-white"
              allow="autoplay"
              title={file.name}
            />
          )}
          
          {isImage && (
             <iframe 
               src={file.webViewLink.replace('/view', '/preview')} 
               className="w-full h-full border-0 bg-transparent hidden"
               title={file.name}
             />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
