"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportDatabaseBackup } from "@/app/actions/settings";
import { Download, Upload, ShieldAlert, Database } from "lucide-react";

export default function BackupTab() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backupData = await exportDatabaseBackup();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `RandomFramesOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Database exported successfully");
    } catch (e) {
      toast.error("Failed to export database");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    toast.error("Import functionality requires backend restoration which is not available in V1.0");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Backup & Restore</h3>
        <p className="text-sm text-zinc-400">Export your data or restore from a previous backup.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Export Database</h4>
          <p className="text-zinc-400 text-sm mb-6">
            Download a complete JSON snapshot of all your Leads, Clients, Projects, Settings, and Financial records.
          </p>
          <Button onClick={handleExport} disabled={isExporting} className="w-full bg-white/10 hover:bg-white/20 text-white">
            {isExporting ? "Exporting..." : "Download Backup"}
          </Button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Restore Database</h4>
          <p className="text-zinc-400 text-sm mb-6">
            Upload a previously exported JSON backup file to restore your entire workspace.
          </p>
          <Button onClick={handleImportClick} variant="outline" className="w-full border-white/10 text-zinc-300 hover:text-white">
            Upload Backup File
          </Button>
        </div>

      </div>

      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-amber-500 font-medium">Important Warning</h5>
          <p className="text-amber-500/80 text-sm mt-1">
            Keep your backup files secure. They contain sensitive client and financial data. Restoring a backup will completely overwrite your current database.
          </p>
        </div>
      </div>
    </div>
  );
}
