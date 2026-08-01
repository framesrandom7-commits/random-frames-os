"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Send, 
  Trash2, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Activity,
  Globe,
  Database,
  Terminal
} from "lucide-react";
import { toast } from "sonner";
import { 
  getWhatsAppSettings, 
  saveWhatsAppSettings, 
  disconnectWhatsAppSettings, 
  verifyWhatsAppConnection,
  testWhatsAppConnection,
  refreshWhatsAppTemplates
} from "@/app/actions/whatsapp-settings";

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  // Form State
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    const data: any = await getWhatsAppSettings();
    if (data.success) {
      setStatus(data);
      if (data.phoneNumberId) setPhoneNumberId(data.phoneNumberId);
      if (data.businessAccountId) setBusinessAccountId(data.businessAccountId);
      if (data.hasAccessToken) setAccessToken("••••••••••••••••••••••••••••••••");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!accessToken || !phoneNumberId) {
      toast.error("Both Access Token and Phone Number ID are required");
      return;
    }
    
    setSaving(true);
    if (accessToken.startsWith("••••")) {
      toast.error("Please enter a new Access Token to update credentials.");
      setSaving(false);
      return;
    }

    const res: any = await saveWhatsAppSettings(accessToken, phoneNumberId, businessAccountId);
    if (res.success) {
      toast.success("WhatsApp Business credentials saved & linked successfully!");
      loadStatus();
    } else {
      toast.error(res.error || "Failed to save settings");
    }
    setSaving(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you certain you want to disconnect WhatsApp Business? Automated reminders and client communications will cease immediately.")) {
      return;
    }
    const res: any = await disconnectWhatsAppSettings();
    if (res.success) {
      toast.info("WhatsApp Business API integration disconnected.");
      setAccessToken("");
      setPhoneNumberId("");
      setBusinessAccountId("");
      loadStatus();
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    const res: any = await verifyWhatsAppConnection();
    if (res.success) {
      toast.success(`Verified API Account: ${res.data.verifiedName || res.data.display_phone_number || "Meta Cloud Account OK"}`);
    } else {
      toast.error(res.error || "Verification failed with Meta servers.");
    }
    setVerifying(false);
  };

  const handleRefreshTemplates = async () => {
    setRefreshing(true);
    const res: any = await refreshWhatsAppTemplates();
    if (res.success) {
      setTemplates(res.templates || []);
      toast.success(`Synchronized ${res.templates?.length || 0} production templates from Random Frames OS registry!`);
    } else {
      toast.error("Failed to refresh template registry.");
    }
    setRefreshing(false);
  };

  const handleTest = async () => {
    if (!testPhone) {
      toast.error("Please enter a destination phone number to test");
      return;
    }
    
    setTesting(true);
    const res: any = await testWhatsAppConnection(testPhone);
    if (res.success) {
      toast.success(`Production welcome template dispatched to ${testPhone}!`);
    } else {
      toast.error(res.error || "Failed to send test message");
    }
    setTesting(false);
  };

  if (loading && !status) {
    return <div className="p-8 text-zinc-400">Loading WhatsApp Cloud API infrastructure...</div>;
  }

  const isConnected = status?.connected;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <PageHeader
        title="WhatsApp Business Cloud API Integration"
        subtitle="Manage Meta Cloud API infrastructure, webhook synchronizations, rate limit telemetry, and production message templates."
      />

      {/* Overview Status Telemetry Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Globe className="w-4 h-4 text-blue-400" /> Webhook & API Version
          </div>
          <div className="mt-2 flex flex-col gap-0.5">
            <div className="text-white text-sm font-bold flex items-center gap-1.5">
              <span>v19.0 Cloud API</span>
            </div>
            <span className="text-xs text-emerald-400 font-mono">{status?.webhookStatus || "Active"}</span>
          </div>
        </Card>

        <Card className="bg-[#111] border-white/5 p-4 flex flex-col justify-between">
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            <Database className="w-4 h-4 text-yellow-400" /> Rate Limits & Tier
          </div>
          <div className="mt-2 text-white text-xs font-semibold">
            {status?.rateLimits || "Tier 1 (1,000 / 24h)"}
            <p className="text-zinc-500 text-[10px] mt-0.5">Auto-scales with account trust</p>
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

      {/* Meta Credentials & Control Actions */}
      <Card className="bg-[#111] border-white/5 shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Meta App Credentials & Account Linking
              </CardTitle>
              <CardDescription className="mt-1 text-zinc-400">
                Enter your permanent Cloud API Access Token, Business Account ID, and Phone Number ID from the Meta Developer Dashboard.
              </CardDescription>
            </div>

            {isConnected && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifying} className="bg-black text-white border-white/10 hover:bg-white/10">
                  <ShieldCheck className={`w-4 h-4 mr-1.5 text-emerald-400 ${verifying ? 'animate-pulse' : ''}`} />
                  {verifying ? "Verifying..." : "Verify Connection"}
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDisconnect} className="bg-red-950/50 hover:bg-red-900 text-red-200 border border-red-900/50">
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-zinc-300">Business Account ID</label>
              <input 
                type="text"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
                placeholder="109876543210987"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-zinc-300">Phone Number ID</label>
              <input 
                type="text"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
                placeholder="123456789012345"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-1">
              <label className="text-sm font-medium text-zinc-300">Permanent Access Token</label>
              <input 
                type="password"
                className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
                placeholder="EAAL..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-white/5 pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving Credentials..." : "Connect & Save Credentials"}
          </Button>
        </CardFooter>
      </Card>

      {/* Production Diagnostics & Template Sync */}
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Connection Card */}
          <Card className="bg-[#111] border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-lg">
                  <Send className="w-5 h-5 text-emerald-500" />
                  Test Message Diagnostic
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Send an interactive production welcome test to verify real-time Meta routing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Recipient Phone (with country code)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
                      placeholder="e.g. 919876543210"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                    />
                    <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 shrink-0" onClick={handleTest} disabled={testing || !testPhone}>
                      <Send className={`w-4 h-4 mr-1.5 ${testing ? 'animate-pulse' : ''}`} />
                      Send Test
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
            <CardFooter className="border-t border-white/5 py-2.5 text-[11px] text-zinc-500">
              Note: Test transmissions consume standard Meta conversational messaging tokens.
            </CardFooter>
          </Card>

          {/* Template Registry Synchronization Card */}
          <Card className="bg-[#111] border-white/5 shadow-2xl flex flex-col justify-between">
            <div>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-white text-lg">
                    <Layers className="w-5 h-5 text-blue-500" />
                    Template Registry
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleRefreshTemplates} disabled={refreshing} className="bg-black border-white/10 hover:bg-white/10 text-xs">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh Templates
                  </Button>
                </div>
                <CardDescription className="text-zinc-400">
                  Synchronize and inspect approved Meta Business templates (Leads, Shoots, Invoices).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <div className="p-4 bg-black/40 border border-white/5 rounded-md text-center text-xs text-zinc-400">
                    Click &ldquo;Refresh Templates&rdquo; to sync the {status?.templatesCount || 16} official production templates.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                    {templates.map((t, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-white/[0.02] border border-white/5 rounded text-xs">
                        <span className="font-mono text-emerald-400 font-semibold">{t.id}</span>
                        <Badge variant="outline" className="text-[10px] bg-white/5 text-zinc-300 border-white/10">{t.category}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
            <CardFooter className="border-t border-white/5 py-2.5 text-[11px] text-zinc-500 flex justify-between">
              <span>All templates follow strict Random Frames OS branding rules.</span>
              <span className="text-white font-mono">{status?.templatesCount || 16} Active</span>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
