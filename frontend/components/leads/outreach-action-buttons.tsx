"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail, AtSign, Phone, X, Voicemail } from "lucide-react";
import { OutreachChannel } from "@prisma/client";
import { markLeadAsContacted, logCallAttempt } from "@/app/actions/lead";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface OutreachActionButtonsProps {
  leadId: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  status: string;
  outreachChannel?: OutreachChannel | null;
}

export function OutreachActionButtons({
  leadId,
  email,
  phone,
  whatsapp,
  instagram,
  status,
  outreachChannel
}: OutreachActionButtonsProps) {
  const [isUpdating, setIsUpdating] = useState<OutreachChannel | null>(null);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isLoggingCall, setIsLoggingCall] = useState(false);

  const handleMarkContacted = async (channel: OutreachChannel, url?: string) => {
    if (url) {
      if (url.startsWith('mailto:') || url.startsWith('tel:')) {
        window.location.href = url;
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
    
    // For phone, we just open the link and show the dialog, we don't mark as contacted automatically
    if (channel === OutreachChannel.PHONE) {
      setIsCallDialogOpen(true);
      return;
    }

    setIsUpdating(channel);
    const result = await markLeadAsContacted(leadId, channel);
    if (result.success) {
      toast.success(`Logged ${channel.replace(/_/g, " ")} outreach`);
    } else {
      toast.error("Failed to update status");
    }
    setIsUpdating(null);
  };

  const handleCallOutcome = async (outcome: 'ANSWERED' | 'NO_ANSWER' | 'VOICEMAIL') => {
    setIsLoggingCall(true);
    const result = await logCallAttempt(leadId, outcome);
    if (result.success) {
      toast.success("Call outcome logged successfully");
      setIsCallDialogOpen(false);
    } else {
      toast.error("Failed to log call outcome");
    }
    setIsLoggingCall(false);
  };

  const isContacted = status === "CONTACTED" || status === "REPLIED" || status === "INTERESTED" || status === "QUALIFIED" || status === "DISCOVERY" || status === "PROPOSAL" || status === "NEGOTIATION" || status === "WON" || status === "CLIENT";

  return (
    <>
      <div className="flex flex-wrap gap-2 items-center">
        {email && (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating !== null}
            onClick={() => handleMarkContacted(OutreachChannel.EMAIL, `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=Regarding your inquiry&authuser=frames.random.7@gmail.com`)}
            className="h-8 text-xs bg-zinc-900 border-white/10"
          >
            {isUpdating === OutreachChannel.EMAIL ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Mail className="w-3 h-3 mr-1 text-zinc-400" />}
            Send Email
          </Button>
        )}

        {instagram && (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating !== null}
            onClick={() => handleMarkContacted(OutreachChannel.INSTAGRAM_DM, `https://instagram.com/${instagram.replace("@", "")}`)}
            className="h-8 text-xs bg-zinc-900 border-white/10"
          >
            {isUpdating === OutreachChannel.INSTAGRAM_DM ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <AtSign className="w-3 h-3 mr-1 text-zinc-400" />}
            Send DM
          </Button>
        )}

        {phone && (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating !== null}
            onClick={() => handleMarkContacted(OutreachChannel.PHONE, `tel:${phone}`)}
            className="h-8 text-xs bg-zinc-900 border-white/10"
          >
            <Phone className="w-3 h-3 mr-1 text-zinc-400" />
            Call
          </Button>
        )}

        {whatsapp && (
          <Button
            size="sm"
            variant="outline"
            disabled={isUpdating !== null}
            onClick={() => handleMarkContacted(OutreachChannel.WHATSAPP, `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`)}
            className="h-8 text-xs bg-zinc-900 border-white/10"
          >
            {isUpdating === OutreachChannel.WHATSAPP ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Phone className="w-3 h-3 mr-1 text-green-400" />}
            Send WA
          </Button>
        )}
      </div>

      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Call Outcome</DialogTitle>
            <DialogDescription className="text-zinc-400">
              How did the call go with this lead?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button 
              disabled={isLoggingCall}
              onClick={() => handleCallOutcome('ANSWERED')}
              className="bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Answered
            </Button>
            <Button 
              disabled={isLoggingCall}
              onClick={() => handleCallOutcome('NO_ANSWER')}
              className="bg-red-900 hover:bg-red-800 text-white w-full flex items-center justify-start gap-2"
            >
              <X className="w-4 h-4" /> No Answer
            </Button>
            <Button 
              disabled={isLoggingCall}
              onClick={() => handleCallOutcome('VOICEMAIL')}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full flex items-center justify-start gap-2"
            >
              <Voicemail className="w-4 h-4" /> Left Voicemail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
