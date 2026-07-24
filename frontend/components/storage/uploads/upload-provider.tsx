"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'error';

export interface UploadTask {
  id: string;
  file: File;
  folderId: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  bytesUploaded: number;
  totalBytes: number;
}

interface UploadContextType {
  uploads: UploadTask[];
  addUploads: (files: File[], folderId: string) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  isCenterOpen: boolean;
  setCenterOpen: (open: boolean) => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isCenterOpen, setCenterOpen] = useState(false);

  const startUpload = async (taskId: string, file: File, folderId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId);

      // Using XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/drive/upload', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploads(prev => prev.map(u => 
            u.id === taskId ? { ...u, progress, bytesUploaded: event.loaded, status: 'uploading' } : u
          ));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploads(prev => prev.map(u => 
            u.id === taskId ? { ...u, progress: 100, bytesUploaded: file.size, status: 'completed' } : u
          ));
        } else {
          setUploads(prev => prev.map(u => 
            u.id === taskId ? { ...u, status: 'error', error: `Server error: ${xhr.status}` } : u
          ));
        }
      };

      xhr.onerror = () => {
        setUploads(prev => prev.map(u => 
          u.id === taskId ? { ...u, status: 'error', error: 'Network error occurred' } : u
        ));
      };

      xhr.send(formData);
    } catch (error: any) {
      setUploads(prev => prev.map(u => 
        u.id === taskId ? { ...u, status: 'error', error: error.message } : u
      ));
    }
  };

  const addUploads = useCallback((files: File[], folderId: string) => {
    setCenterOpen(true);
    
    const newTasks: UploadTask[] = files.map(file => ({
      id: uuidv4(),
      file,
      folderId,
      progress: 0,
      status: 'pending',
      bytesUploaded: 0,
      totalBytes: file.size
    }));

    setUploads(prev => [...prev, ...newTasks]);

    // Start uploads sequentially or concurrently. Here we do concurrently.
    newTasks.forEach(task => {
      startUpload(task.id, task.file, task.folderId);
    });
  }, []);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => prev.filter(u => u.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => prev.filter(u => u.status !== 'completed'));
  }, []);

  return (
    <UploadContext.Provider value={{ uploads, addUploads, removeUpload, clearCompleted, isCenterOpen, setCenterOpen }}>
      {children}
    </UploadContext.Provider>
  );
}

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
};
