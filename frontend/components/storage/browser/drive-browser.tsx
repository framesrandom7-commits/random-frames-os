"use client";

import React, { useState, useEffect } from "react";
import { Folder, File as FileIcon, LayoutGrid, List, Search, ChevronRight, Download, Link as LinkIcon, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDriveFolderContents } from "@/app/actions/drive";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { MediaPreview } from "@/components/storage/preview/media-preview";

interface DriveBrowserProps {
  rootFolderId?: string;
  onPreview?: (file: any) => void;
}

export function DriveBrowser({ rootFolderId, onPreview }: DriveBrowserProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(rootFolderId);
  const [history, setHistory] = useState<{id: string, name: string}[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  useEffect(() => {
    async function fetchFolder() {
      if (!currentFolderId) return;
      setLoading(true);
      const res = await getDriveFolderContents(currentFolderId);
      if (res.success) {
        setFiles(res.files || []);
      }
      setLoading(false);
    }
    fetchFolder();
  }, [currentFolderId]);

  const navigateToFolder = (folderId: string, folderName: string) => {
    setHistory([...history, { id: currentFolderId as string, name: "Previous" }]); // Simplified history tracking
    setCurrentFolderId(folderId);
  };

  const navigateUp = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentFolderId(previous.id);
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const folders = filteredFiles.filter(f => f.mimeType === 'application/vnd.google-apps.folder');
  const documents = filteredFiles.filter(f => f.mimeType !== 'application/vnd.google-apps.folder');

  return (
    <div className="flex flex-col h-[600px] bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-zinc-400">
            <Button variant="ghost" size="sm" onClick={navigateUp} disabled={history.length === 0} className="px-2 hover:text-white">
              Root
            </Button>
            {history.length > 0 && <ChevronRight className="h-4 w-4" />}
            {history.length > 0 && <span className="text-white font-medium">Current Folder</span>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Search files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 bg-black/40 border-white/10 text-sm focus-visible:ring-1 focus-visible:ring-white/20" 
            />
          </div>
          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 w-7 p-0 rounded-md ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-7 w-7 p-0 rounded-md ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Browser Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <ScrollArea className="flex-1 h-full bg-zinc-950 p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <span className="animate-pulse">Loading drive contents...</span>
            </div>
          ) : !currentFolderId ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <p>No storage folder connected</p>
            </div>
          ) : (
            <div className="space-y-8">
              {folders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-4 px-1">Folders</h3>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
                    {folders.map(folder => (
                      <Card 
                        key={folder.id} 
                        className={`bg-white/5 hover:bg-white/10 border-white/5 transition-colors cursor-pointer group flex ${viewMode === 'grid' ? 'flex-col items-center justify-center p-4 text-center aspect-square' : 'flex-row items-center p-3 gap-4'}`}
                        onClick={() => navigateToFolder(folder.id, folder.name)}
                      >
                        <Folder className={`text-blue-400 ${viewMode === 'grid' ? 'h-10 w-10 mb-3' : 'h-6 w-6'}`} fill="currentColor" fillOpacity={0.2} />
                        <span className={`font-medium text-zinc-200 group-hover:text-white truncate w-full ${viewMode === 'grid' ? 'text-xs' : 'text-sm'}`}>{folder.name}</span>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {documents.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-zinc-400 mb-4 px-1">Files</h3>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
                    {documents.map(file => (
                      <Card 
                        key={file.id} 
                        className={`bg-white/5 hover:bg-white/10 border-white/5 transition-colors cursor-pointer group flex ${viewMode === 'grid' ? 'flex-col p-3 aspect-[3/4] relative overflow-hidden' : 'flex-row items-center p-3 gap-4'}`}
                        onClick={() => {
                          if (onPreview) onPreview(file);
                          else setPreviewFile(file);
                        }}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="flex-1 w-full bg-black/20 rounded mb-2 flex items-center justify-center overflow-hidden">
                              {file.thumbnailLink ? (
                                <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                              ) : (
                                <FileIcon className="h-8 w-8 text-zinc-600" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-zinc-200 truncate w-full group-hover:text-white">{file.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="h-8 w-8 bg-black/20 rounded flex items-center justify-center shrink-0">
                               {file.thumbnailLink ? (
                                <img src={file.thumbnailLink} alt={file.name} className="w-full h-full object-cover rounded" />
                              ) : (
                                <FileIcon className="h-4 w-4 text-zinc-500" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-zinc-200 truncate group-hover:text-white flex-1">{file.name}</span>
                            <span className="text-xs text-zinc-500 w-24 text-right">
                              {file.size ? (parseInt(file.size) / 1024 / 1024).toFixed(1) + " MB" : ""}
                            </span>
                          </>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {filteredFiles.length === 0 && (
                <div className="flex flex-col h-64 items-center justify-center text-zinc-500">
                  <Folder className="h-12 w-12 mb-3 opacity-20" />
                  <p>Folder is empty</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <MediaPreview 
        file={previewFile} 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
      />
    </div>
  );
}
