"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Download, Database, HardDrive, Clock, FileJson, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  const handleExport = (type: string) => {
    setIsExporting(true);
    toast.info(`Preparing ${type} export...`);
    
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`${type} exported successfully as CSV`);
    }, 1500);
  };

  const handleManualBackup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Running manual database backup...",
        success: "Database backup completed successfully!",
        error: "Backup failed",
      }
    );
  };

  return (
    <div className="flex h-full w-full flex-col p-8 overflow-y-auto">
      <PageHeader 
        title="Backup & Export" 
        subtitle="Manage your data securely. Download records or run manual database backups."
        action={
          <button 
            onClick={() => handleExport("Full Data")}
            disabled={isExporting}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#E53935] px-4 text-sm font-bold text-white transition-all hover:bg-red-700 shadow-[0_0_20px_rgba(229,57,53,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" /> 
            {isExporting ? "Exporting..." : "Export All Data"}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        
        {/* Automated Backups Card */}
        <div className="rounded-xl border border-white/5 bg-[#171A21] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-lg bg-[#E53935]/10 flex items-center justify-center text-[#E53935] mb-4">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Backups</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Automatically back up your entire database every 24 hours to secure cloud storage.
            </p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${autoBackupEnabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`}></div>
              <span className="text-sm font-medium text-white">{autoBackupEnabled ? "Active (Daily)" : "Paused"}</span>
            </div>
            <button 
              onClick={() => {
                setAutoBackupEnabled(!autoBackupEnabled);
                toast.success(`Automated backups ${!autoBackupEnabled ? 'enabled' : 'disabled'}`);
              }}
              className="text-xs font-bold text-[#E53935] hover:text-red-400 transition-colors"
            >
              {autoBackupEnabled ? "Disable" : "Enable"}
            </button>
          </div>
        </div>

        {/* Manual Database Backup Card */}
        <div className="rounded-xl border border-white/5 bg-[#171A21] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-lg bg-[#E53935]/10 flex items-center justify-center text-[#E53935] mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Database Snapshot</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Run an immediate manual backup of the current database state. Last backup was today at 08:30 AM.
            </p>
          </div>
          <button 
            onClick={handleManualBackup}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all"
          >
            <HardDrive className="h-4 w-4" /> Run Backup Now
          </button>
        </div>

        {/* Data Export Options */}
        <div className="rounded-xl border border-white/5 bg-[#171A21] p-6 shadow-xl md:col-span-2 lg:col-span-1 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Download className="h-5 w-5 text-[#E53935]" />
            Export Data
          </h3>
          <div className="flex flex-col gap-3 flex-1">
            <button 
              onClick={() => handleExport("Clients")}
              className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-white">Clients & Leads</span>
              </div>
              <Download className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
            <button 
              onClick={() => handleExport("Projects")}
              className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileJson className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-white">Projects & Shoots</span>
              </div>
              <Download className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
            <button 
              onClick={() => handleExport("Finance")}
              className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-white">Finance & Invoices</span>
              </div>
              <Download className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
