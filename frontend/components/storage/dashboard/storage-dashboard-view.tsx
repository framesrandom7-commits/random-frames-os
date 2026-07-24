"use client";

import React, { useState } from "react";
import { HardDrive, Cloud, AlertCircle, CheckCircle2, Activity, Folder, UploadCloud, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function StorageDashboardView({ settings, quota }: { settings: any, quota: any }) {
  const isConnected = settings?.syncStatus === 'CONNECTED';
  const [isSyncing, setIsSyncing] = useState(false);

  const formatBytes = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const usagePercent = quota ? (quota.usedBytes / quota.totalBytes) * 100 : 0;

  const handleSync = async () => {
    setIsSyncing(true);
    // TODO: implement manual sync server action
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Connection Status</CardTitle>
            <Cloud className={`h-4 w-4 ${isConnected ? 'text-blue-400' : 'text-zinc-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">
              {isConnected ? "Google Drive" : "Disconnected"}
            </div>
            {isConnected ? (
              <div className="flex items-center text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Sync Active
              </div>
            ) : (
              <div className="flex items-center text-xs text-red-400 font-medium">
                <AlertCircle className="mr-1 h-3 w-3" /> Action Required
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {quota ? formatBytes(quota.usedBytes) : "—"}
            </div>
            <Progress value={usagePercent} className="h-2 bg-white/10 indicator-blue" />
            <div className="mt-2 text-xs text-zinc-400">
              {quota ? `${usagePercent.toFixed(1)}% of ${formatBytes(quota.totalBytes)}` : "Analyzing..."}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Recent Uploads</CardTitle>
            <UploadCloud className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <div className="text-xs text-zinc-400">In the last 7 days</div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Storage Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400 mb-1">Optimal</div>
            <div className="text-xs text-zinc-400">All services running</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-zinc-500">
                <Folder className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No recent storage activity</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-3">
              {!isConnected ? (
                <div className="flex flex-col gap-3">
                  <a href="/api/auth/google/login" className={buttonVariants({ className: "w-full bg-[#4285F4] hover:bg-[#3367D6] text-white" })}>
                    <Cloud className="mr-2 h-4 w-4" /> Connect Google Drive
                  </a>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleSync} 
                    disabled={isSyncing}
                    variant="outline" 
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
                    {isSyncing ? 'Syncing...' : 'Force Sync State'}
                  </Button>
                  <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline", className: "w-full border-[#4285F4]/30 bg-[#4285F4]/10 hover:bg-[#4285F4]/20 text-[#4285F4]" })}>
                    Open in Drive
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
