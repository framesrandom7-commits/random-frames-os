"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, AtSign, CheckCircle2, Loader2, Globe, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Typography } from "@/components/ui/typography";
import { OutreachProgress } from "./outreach-progress";
import { CallOutcomeDialog } from "@/components/calls/call-outcome-dialog";

interface QuickOutreachActionsProps {
  leadId: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  website?: string | null;
  fullAddress?: string | null;
  status: string;
  outreachChannel?: OutreachChannel | null;
  activities?: any[];
}

export function QuickOutreachActions({
  leadId,
  email,
  phone,
  whatsapp,
  instagram,
  website,
  fullAddress,
  status,
  outreachChannel,
  activities = []
}: QuickOutreachActionsProps) {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const handlePhoneClick = () => {
    if (phone) {
      setIsCallDialogOpen(true);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-start gap-3 min-w-0">
        <Mail className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-medium text-zinc-500">Email</p>
          {email ? (
            <a href={`mailto:${email}`} className="text-white hover:underline break-all">
              {email}
            </a>
          ) : (
            <p className="text-white">—</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <AtSign className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-medium text-zinc-500">Instagram</p>
          {instagram ? (
            <a href={`https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="text-white hover:underline break-all">
              {instagram}
            </a>
          ) : (
            <p className="text-white">—</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <Phone className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-medium text-zinc-500">Phone</p>
          {phone ? (
            <button 
              onClick={handlePhoneClick}
              className="text-white hover:underline break-all text-left"
            >
              {phone}
            </button>
          ) : (
            <p className="text-white">—</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <Phone className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-medium text-zinc-500">WhatsApp</p>
          {whatsapp ? (
            <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-white hover:underline break-all">
              {whatsapp}
            </a>
          ) : (
            <p className="text-white">—</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <Globe className="w-5 h-5 text-zinc-400 mt-0.5 shrink-0" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-medium text-zinc-500">Website</p>
          <p className="text-white">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-white hover:underline break-all">
                {website}
              </a>
            ) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col min-w-0 md:col-start-2 md:row-start-3 md:row-span-2 md:justify-self-end">
        <OutreachProgress activities={activities} />
      </div>

      <div className="flex items-start gap-3 min-w-0">
        <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-zinc-500">Address</p>
          <p className="text-white">{fullAddress || "—"}</p>
        </div>
      </div>
      </div>
      
      <CallOutcomeDialog
        open={isCallDialogOpen}
        onOpenChange={setIsCallDialogOpen}
        targetType="LEAD"
        targetId={leadId}
      />
    </>
  );
}
