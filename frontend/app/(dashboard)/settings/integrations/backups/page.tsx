"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { triggerManualBackup } from "@/app/actions/integrations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, CloudUpload, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function BackupCenterPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<{ filepath: string; size: number } | null>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await triggerManualBackup();
      if (response.success && response.data) {
        setLastBackup(response.data);
        toast.success("Database Backup created successfully.");
      } else {
        toast.error("Failed to generate backup.");
      }
    } catch (e) {
      toast.error("An error occurred during backup generation.");
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Backups & Data" 
        subtitle="Manage your database exports and restorations"
      />

      <div className="flex gap-2 mb-4">
        <Link href="/settings/integrations" className="px-4 py-2 text-zinc-400 hover:bg-white/5 hover:text-white rounded-md text-sm font-medium transition-colors">Providers</Link>
        <Link href="/settings/integrations/webhooks" className="px-4 py-2 text-zinc-400 hover:bg-white/5 hover:text-white rounded-md text-sm font-medium transition-colors">Webhooks</Link>
        <Link href="/settings/integrations/backups" className="px-4 py-2 bg-white/10 text-white rounded-md text-sm font-medium">Backups & Data</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#111] border-white/10 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Database className="text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Manual Backup</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  Generate a full JSON dump of your database containing all core business models.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 border-t border-white/5 flex flex-col gap-4">
            {lastBackup ? (
              <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white font-medium mb-1">Backup Ready</div>
                  <div className="text-xs text-zinc-400">Size: {(lastBackup.size / 1024).toFixed(2)} KB</div>
                </div>
                <a href={lastBackup.filepath} download>
                  <Button variant="outline" size="sm" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">
                    <Download size={14} className="mr-2" /> Download
                  </Button>
                </a>
              </div>
            ) : (
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white"
              >
                {isBackingUp ? <Clock className="animate-spin mr-2" size={16} /> : <Download size={16} className="mr-2" />}
                {isBackingUp ? "Generating Backup..." : "Generate Backup Now"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-white/10 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CloudUpload className="text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Restore Data</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  Restore your system state from a previously generated JSON backup file.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 border-t border-white/5 flex flex-col items-center justify-center text-center py-8">
            <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-8 w-full cursor-not-allowed opacity-50">
              <CloudUpload className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
              <div className="text-sm font-medium text-white mb-1">Drag and drop JSON file</div>
              <div className="text-xs text-zinc-400">Restore functionality is locked in this environment.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
