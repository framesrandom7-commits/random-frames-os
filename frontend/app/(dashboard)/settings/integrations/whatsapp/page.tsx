"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle2, AlertCircle, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { getWhatsAppSettings, saveWhatsAppSettings, testWhatsAppConnection } from "@/app/actions/whatsapp-settings";

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Form State
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
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
    const tokenToSave = accessToken.startsWith("••••") ? undefined : accessToken;
    
    // In a real app we'd fetch the old token if they didn't change it, 
    // but our action blindly updates. So we must force them to re-enter if they want to edit phone number?
    // Actually, if it's bulleted, we should warn them.
    if (accessToken.startsWith("••••")) {
      toast.error("Please re-enter your Access Token to save changes.");
      setSaving(false);
      return;
    }

    const res: any = await saveWhatsAppSettings(accessToken, phoneNumberId);
    if (res.success) {
      toast.success("WhatsApp settings saved successfully!");
      loadStatus();
    } else {
      toast.error(res.error || "Failed to save settings");
    }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!testPhone) {
      toast.error("Please enter a phone number to test");
      return;
    }
    
    setTesting(true);
    const res: any = await testWhatsAppConnection(testPhone);
    if (res.success) {
      toast.success(`Test message sent successfully to ${testPhone}!`);
    } else {
      toast.error(res.error || "Failed to send test message");
    }
    setTesting(false);
  };

  if (loading && !status) {
    return <div className="p-8 text-zinc-400">Loading settings...</div>;
  }

  const isConnected = (status as any)?.connected;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <PageHeader
        title="WhatsApp Business API Integration"
        subtitle="Configure your Meta Developer application credentials to enable automated messaging."
      />

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-[#111] border-white/5 shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Meta App Credentials
                </CardTitle>
                <CardDescription className="mt-1 text-zinc-400">
                  Enter your permanent Access Token and Phone Number ID from the Meta Developer Dashboard.
                </CardDescription>
              </div>
              <Badge variant="outline" className={isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
                {isConnected ? "Configured" : "Not Configured"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Permanent Access Token</label>
                <input 
                  type="password"
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="EAAL..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Phone Number ID</label>
                <input 
                  type="text"
                  className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  placeholder="123456789012345"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end border-t border-white/5 pt-4">
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Credentials
            </Button>
          </CardFooter>
        </Card>

        {isConnected && (
          <Card className="bg-[#111] border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Test Connection
              </CardTitle>
              <CardDescription className="mt-1 text-zinc-400">
                Send a test Welcome template to a specific phone number to verify API connectivity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2 max-w-sm">
                  <label className="text-sm font-medium text-zinc-300">Test Phone Number (with country code)</label>
                  <input 
                    type="text"
                    className="w-full bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="e.g. 919876543210"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <Button variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 h-[38px]" onClick={handleTest} disabled={testing || !testPhone}>
                  <Send className={`w-4 h-4 mr-2 ${testing ? 'animate-pulse' : ''}`} />
                  Send Test Message
                </Button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                Note: If using a Meta Test account, the recipient number must be registered in the Meta Developer Dashboard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
