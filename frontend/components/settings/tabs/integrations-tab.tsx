"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Mail, MessageCircle, HardDrive, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { syncWeb3FormsEmails } from "@/app/actions/integrations";

interface IntegrationState {
  connected: boolean;
  lastSync: string | null;
  loading: boolean;
}

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<{ [key: string]: IntegrationState }>({
    google_calendar: { connected: false, lastSync: null, loading: false },
    gmail: { connected: false, lastSync: null, loading: false },
    whatsapp: { connected: true, lastSync: new Date().toISOString(), loading: false }, // WhatsApp click-to-chat is native
    google_drive: { connected: false, lastSync: null, loading: false }
  });

  const handleConnect = (id: string, name: string) => {
    setIntegrations(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    
    // Simulate OAuth flow
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [id]: { connected: true, lastSync: new Date().toISOString(), loading: false }
      }));
      toast.success(`${name} connected successfully.`);
    }, 1500);
  };

  const handleDisconnect = (id: string, name: string) => {
    setIntegrations(prev => ({
      ...prev,
      [id]: { connected: false, lastSync: null, loading: false }
    }));
    toast.info(`${name} disconnected.`);
  };

  const handleSync = async (id: string, name: string) => {
    setIntegrations(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }));
    
    if (id === "gmail") {
      const result = await syncWeb3FormsEmails();
      setIntegrations(prev => ({
        ...prev,
        [id]: { ...prev[id], lastSync: new Date().toISOString(), loading: false }
      }));
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } else {
      // Simulate Sync for others
      setTimeout(() => {
        setIntegrations(prev => ({
          ...prev,
          [id]: { ...prev[id], lastSync: new Date().toISOString(), loading: false }
        }));
        toast.success(`${name} synced successfully.`);
      }, 1000);
    }
  };

  const renderIntegrationCard = (
    id: string, 
    name: string, 
    description: string, 
    Icon: any, 
    colorClass: string,
    badgeText: string = ""
  ) => {
    const state = integrations[id];
    
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-xl transition-all hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h4 className="text-white font-medium text-base">{name}</h4>
              {badgeText && <Badge variant="outline" className="text-xs bg-white/5 border-white/10">{badgeText}</Badge>}
              {state.connected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-sm text-zinc-400">{description}</p>
            {state.connected && state.lastSync && (
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                <RefreshCw className="w-3 h-3" /> Last synced: {new Date(state.lastSync).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {state.connected ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSync(id, name)} 
                disabled={state.loading}
                className="border-white/10 text-white bg-black hover:bg-white/10"
              >
                {state.loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Sync Now
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => handleDisconnect(id, name)} 
                disabled={state.loading}
                className="bg-red-950/50 hover:bg-red-900 text-red-200 border border-red-900/50"
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => handleConnect(id, name)} 
              disabled={state.loading}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {state.loading ? "Connecting..." : "Connect"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h3 className="text-xl font-semibold text-white tracking-tight">Integrations</h3>
        <p className="text-sm text-zinc-400 mt-1">Connect Random Frames OS with your external tools for automation.</p>
      </div>

      <div className="space-y-4">
        {renderIntegrationCard(
          "gmail", 
          "Gmail & Web3Forms", 
          "Read Web3Forms enquiries to auto-create leads. Send quotes and invoices.", 
          Mail, 
          "bg-red-500/10 text-red-400"
        )}

        {renderIntegrationCard(
          "google_calendar", 
          "Google Calendar", 
          "Two-way sync for all shoots, meetings, and project deadlines.", 
          Calendar, 
          "bg-blue-500/10 text-blue-400"
        )}

        {renderIntegrationCard(
          "google_drive", 
          "Google Drive", 
          "Automatically generate nested folder structures for every new project.", 
          HardDrive, 
          "bg-yellow-500/10 text-yellow-400"
        )}

        {renderIntegrationCard(
          "whatsapp", 
          "WhatsApp Business", 
          "Click-to-chat integration for instant invoice and quote sharing.", 
          MessageCircle, 
          "bg-emerald-500/10 text-emerald-400",
          "Native API"
        )}
      </div>
    </div>
  );
}
