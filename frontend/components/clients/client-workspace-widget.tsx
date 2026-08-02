"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar as CalendarIcon, HardDrive, Users, ExternalLink, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ClientWorkspaceWidgetProps {
  clientId: string;
  email?: string | null;
  phone?: string | null;
  businessName: string;
  driveUrl?: string | null;
}

export function ClientWorkspaceWidget({ clientId, email, phone, businessName, driveUrl }: ClientWorkspaceWidgetProps) {
  const handleEmailClient = () => {
    if (!email) {
      toast.error("No email address configured for this client.");
      return;
    }
    window.open(`mailto:${email}?subject=Collaboration%20with%20Random%20Frames%20OS`, "_blank");
    toast.success("Opening Gmail writer for client communication.");
  };

  const handleOpenThread = () => {
    if (!email) {
      toast.error("No email address to locate Gmail thread.");
      return;
    }
    window.open(`https://mail.google.com/mail/u/0/#search/from%3A${encodeURIComponent(email)}`, "_blank");
    toast.info(`Searching Gmail threads for ${email}`);
  };

  const handleOpenDrive = () => {
    const url = driveUrl || `https://drive.google.com/drive/search?q=${encodeURIComponent(businessName)}`;
    window.open(url, "_blank");
    toast.info("Launching Google Drive workspace folder.");
  };

  const handleOpenCalendar = () => {
    window.open(`https://calendar.google.com/calendar/u/0/r/search?q=${encodeURIComponent(businessName)}`, "_blank");
    toast.info("Displaying scheduled shoots and meetings on Google Calendar.");
  };

  return (
    <div className="p-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl space-y-4 shadow-lg">
      <div className="flex justify-between items-center pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Google Workspace & Contacts</h4>
            <p className="text-xs text-zinc-400">Unified communication & storage hub</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized Contact
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
        <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
          <span className="text-zinc-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-red-400" /> Email Address:</span>
          <span className="font-mono text-white truncate max-w-[180px]">{email || "Not Provided"}</span>
        </div>
        <div className="p-2.5 bg-black/30 border border-white/5 rounded-xl flex items-center justify-between">
          <span className="text-zinc-500 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400" /> Contact Status:</span>
          <span className="text-emerald-400 font-semibold">Verified & Deduplicated</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          onClick={handleEmailClient}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold"
        >
          <Mail className="w-3.5 h-3.5 mr-1.5 text-red-400" /> Email Client
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenThread}
          className="bg-zinc-800/60 border-white/10 text-zinc-200 hover:bg-zinc-700 text-xs"
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Open Gmail Thread
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenDrive}
          className="bg-zinc-800/60 border-white/10 text-zinc-200 hover:bg-zinc-700 text-xs"
        >
          <HardDrive className="w-3.5 h-3.5 mr-1.5 text-yellow-400" /> Open Drive
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleOpenCalendar}
          className="bg-zinc-800/60 border-white/10 text-zinc-200 hover:bg-zinc-700 text-xs"
        >
          <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Open Calendar
        </Button>
      </div>
    </div>
  );
}
