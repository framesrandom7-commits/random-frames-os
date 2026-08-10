import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getDriveStatus } from "@/app/actions/drive-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, HardDrive, RefreshCw, XCircle, Wrench } from "lucide-react";
import { DriveSettingsClient } from "./client-page";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GoogleDriveSettingsPage() {
  const status = await getDriveStatus();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/settings/integrations" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Back to Integrations
        </Link>
        <PageHeader 
          title="Google Drive Integration" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#111] border-white/10 shadow-md">
          <CardHeader className="pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <HardDrive className="text-blue-500" size={24} />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Connection Status</CardTitle>
                <CardDescription className="text-zinc-400 text-sm">OAuth 2.0 Authorization</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-400 text-sm">Status</span>
                {status.connected ? (
                  <span className="flex items-center text-sm font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                    <CheckCircle2 size={14} className="mr-1.5" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center text-sm font-medium text-zinc-500 bg-zinc-500/10 px-3 py-1 rounded-full">
                    <AlertCircle size={14} className="mr-1.5" /> Disconnected
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-zinc-400 text-sm">Last Sync</span>
                <span className="text-white text-sm">{status.lastSync ? new Date(status.lastSync).toLocaleString() : "Never"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-zinc-400 text-sm">Last Error</span>
                <span className="text-rose-500 text-sm max-w-[200px] truncate" title={status.lastError || ""}>
                  {status.lastError || "None"}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <DriveSettingsClient status={status} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-white/10 shadow-md">
          <CardHeader className="pb-4 border-b border-white/5">
            <CardTitle className="text-white text-lg">Integration Features</CardTitle>
            <CardDescription className="text-zinc-400 text-sm">What this integration does</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                <span className="text-zinc-300 text-sm">Automatically creates Client folders when a Lead is converted.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                <span className="text-zinc-300 text-sm">Automatically creates Project folders when a Client is onboarded.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                <span className="text-zinc-300 text-sm">Maintains a strict, organized folder hierarchy for all business assets.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={16} />
                <span className="text-zinc-300 text-sm">Never blocks CRM operations if Google Drive is temporarily unavailable (built-in retry system).</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
