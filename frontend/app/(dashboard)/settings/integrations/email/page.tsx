"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntegrationsNav } from "@/components/settings/integrations-nav";
import { 
  Mail, 
  Save, 
  Send, 
  Trash2, 
  Activity,
  Globe,
  Terminal,
  Server
} from "lucide-react";
import { toast } from "sonner";
import { 
  getEmailSettings, 
  saveEmailSettings, 
  disconnectEmailSettings, 
  testEmailConnection
} from "@/app/actions/email-settings";

export default function EmailSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Form State
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [secure, setSecure] = useState(false);
  
  const [testEmail, setTestEmail] = useState("");

  const loadStatus = async () => {
    setLoading(true);
    const data: any = await getEmailSettings();
    if (data.success) {
      setStatus(data);
      if (data.host) setHost(data.host);
      if (data.port) setPort(data.port);
      if (data.user) setUser(data.user);
      if (data.secure !== undefined) setSecure(data.secure);
      if (data.hasPassword) setPass("••••••••••••••••");
    }
    setLoading(false);
  };

  useEffect(() => {
     
    loadStatus();
  }, []);

  const handleSave = async () => {
    if (!host || !port || !user) {
      toast.error("Host, Port, and Username are required.");
      return;
    }
    
    setSaving(true);
    if (pass.startsWith("••••") && !status?.hasPassword) {
      toast.error("Please enter a valid password.");
      setSaving(false);
      return;
    }

    const res: any = await saveEmailSettings(host, port, user, pass, secure);
    if (res.success) {
      toast.success("SMTP Email credentials saved securely!");
      loadStatus();
    } else {
      toast.error(res.error || "Failed to save settings");
    }
    setSaving(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you certain you want to disconnect your SMTP Server? Automated emails and client communications will cease immediately.")) {
      return;
    }
    const res: any = await disconnectEmailSettings();
    if (res.success) {
      toast.info("SMTP Email integration disconnected.");
      setHost("");
      setPort("587");
      setUser("");
      setPass("");
      setSecure(false);
      loadStatus();
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error("Please enter a destination email to test");
      return;
    }
    
    setTesting(true);
    const res: any = await testEmailConnection(testEmail);
    if (res.success) {
      toast.success(`Production test email dispatched to ${testEmail}!`);
    } else {
      toast.error(res.error || "Failed to send test message. Check your credentials.");
    }
    setTesting(false);
  };

  if (loading && !status) {
    return <div className="p-8 text-zinc-400">Loading SMTP Email infrastructure...</div>;
  }

  const isConnected = status?.connected && status?.hasPassword;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <IntegrationsNav />
      <div className="flex flex-col gap-2">
        <PageHeader
          title="SMTP Email Integration" />
      </div>

      {/* Overview Status Telemetry Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-[#111] border-white/5 p-4 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-emerald-400" /> Connection Status
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className={isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm py-0.5" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-sm py-0.5"}>
              {isConnected ? "Connected & Active" : "Not Configured"}
            </Badge>
          </div>
        </Card>

        <Card className="bg-[#111] border-white/5 p-4 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <Globe className="w-4 h-4 text-blue-400" /> Transport Configuration
          </div>
          <div className="mt-2 flex flex-col gap-0.5">
            <div className="text-white text-sm font-bold flex items-center gap-1.5">
              <span>{status?.host || "No Host"} : {status?.port || "No Port"}</span>
            </div>
            <span className="text-xs text-zinc-500 font-mono">TLS/SSL: {status?.secure ? "Enabled" : "Auto (STARTTLS)"}</span>
          </div>
        </Card>

        <Card className="bg-[#111] border-white/5 p-4 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-purple-400" /> Last Sync / Telemetry Error
          </div>
          <div className="mt-2">
            <div className="text-zinc-300 text-xs font-mono">
              {status?.lastSync ? new Date(status.lastSync).toLocaleTimeString() : "Synchronized"}
            </div>
            <div className="text-[11px] text-zinc-500 truncate mt-0.5">
              Error: <span className={status?.lastError ? "text-red-400 font-bold" : "text-emerald-400"}>{status?.lastError || "None (Nominal)"}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* SMTP Credentials & Control Actions */}
      <Card className="bg-[#111] border-white/5 shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Server className="w-5 h-5 text-rose-500" />
                SMTP Server Credentials
              </CardTitle>
              <CardDescription className="mt-1 text-zinc-400">
                Enter your SMTP configuration details. Your password will be encrypted before being stored in the database.
              </CardDescription>
            </div>

            {isConnected && (
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDisconnect} className="bg-red-950/50 hover:bg-red-900 text-red-200 border border-red-900/50">
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Host</label>
              <input 
                type="text"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 font-mono"
                placeholder="smtp.gmail.com"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Port</label>
              <input 
                type="text"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 font-mono"
                placeholder="587"
                value={port}
                onChange={(e) => setPort(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Username (Email Address)</label>
              <input 
                type="email"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 font-mono"
                placeholder="you@domain.com"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">SMTP Password (or App Password)</label>
              <input 
                type="password"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 font-mono"
                placeholder="••••••••••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2 pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 cursor-pointer w-fit">
                <input 
                  type="checkbox"
                  className="bg-black border border-white/10 rounded text-rose-500 focus:ring-rose-500/50"
                  checked={secure}
                  onChange={(e) => setSecure(e.target.checked)}
                />
                Use Secure Connection (TLS/SSL immediately on connection)
              </label>
              <p className="text-[11px] text-zinc-500 ml-5">
                Leave unchecked for Port 587 (STARTTLS). Check for Port 465 (Implicit SSL).
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-white/5 pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-rose-600 text-white hover:bg-rose-700 font-semibold">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving Credentials..." : "Connect & Save Credentials"}
          </Button>
        </CardFooter>
      </Card>

      {/* Production Diagnostics */}
      {isConnected && (
        <Card className="bg-[#111] border-white/5 shadow-2xl flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <Send className="w-5 h-5 text-rose-500" />
                Test Mail Diagnostic
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Send a real test email via your SMTP configuration to verify delivery.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Recipient Email Address</label>
                <div className="flex gap-2">
                  <input 
                    type="email"
                    className="flex-1 bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 font-mono"
                    placeholder="e.g. your-personal@gmail.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 shrink-0" onClick={handleTest} disabled={testing || !testEmail}>
                    <Send className={`w-4 h-4 mr-1.5 ${testing ? 'animate-pulse' : ''}`} />
                    Send Test Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}
