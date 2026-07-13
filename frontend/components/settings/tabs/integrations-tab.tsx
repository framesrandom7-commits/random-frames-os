"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Mail, MessageCircle, HardDrive } from "lucide-react";

export default function IntegrationsTab() {
  
  const handleConnect = (service: string) => {
    toast.info(`${service} integration placeholder. Coming in future update.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Integrations</h3>
        <p className="text-sm text-zinc-400">Connect Random Frames OS with your favorite external services.</p>
      </div>

      <div className="space-y-4">
        
        {/* Google Calendar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-medium">Google Calendar</h4>
              <p className="text-sm text-zinc-400">Two-way sync for all shoots and meetings.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleConnect('Google Calendar')} className="border-white/10 text-white shrink-0">
            Connect
          </Button>
        </div>

        {/* Gmail */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-medium">Gmail</h4>
              <p className="text-sm text-zinc-400">Send invoices and quotations directly from your email.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleConnect('Gmail')} className="border-white/10 text-white shrink-0">
            Connect
          </Button>
        </div>

        {/* WhatsApp */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-medium">WhatsApp Business</h4>
              <p className="text-sm text-zinc-400">Send automated payment links and shoot reminders via WhatsApp.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleConnect('WhatsApp')} className="border-white/10 text-white shrink-0">
            Connect
          </Button>
        </div>

        {/* Google Drive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-500/10 text-yellow-400 rounded-lg flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-medium">Google Drive</h4>
              <p className="text-sm text-zinc-400">Automatically sync and deliver client photos/videos.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleConnect('Google Drive')} className="border-white/10 text-white shrink-0">
            Connect
          </Button>
        </div>

      </div>
    </div>
  );
}
