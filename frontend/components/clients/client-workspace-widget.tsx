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

  const handleOpenPortal = () => {
    // Navigating internally using Next.js router would be better, but window.open in same tab works, or we can use next/navigation
    window.location.href = `/clients/${clientId}/workspace`;
    toast.info("Launching Client Workspace.");
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleOpenPortal}
        className="w-full flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
      >
        <ExternalLink className="w-5 h-5" />
        Open Client Workspace
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleEmailClient}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <Mail className="w-6 h-6 text-red-400" />
          <span className="text-xs font-medium">Send Email</span>
        </Button>
        <Button
          onClick={handleOpenThread}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <MessageSquare className="w-6 h-6 text-blue-400" />
          <span className="text-xs font-medium">View Thread</span>
        </Button>
        <Button
          onClick={handleOpenDrive}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <HardDrive className="w-6 h-6 text-yellow-400" />
          <span className="text-xs font-medium">Open Drive</span>
        </Button>
        <Button
          onClick={handleOpenCalendar}
          className="flex flex-col items-center justify-center gap-2 h-24 bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all shadow-none"
        >
          <CalendarIcon className="w-6 h-6 text-emerald-400" />
          <span className="text-xs font-medium">Calendar</span>
        </Button>
      </div>
    </div>
  );
}
