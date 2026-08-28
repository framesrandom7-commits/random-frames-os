"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";
import { CallOutcomeDialog } from "@/components/calls/call-outcome-dialog";

interface ClientPhoneActionProps {
  clientId: string;
  phone?: string | null;
}

export function ClientPhoneAction({ clientId, phone }: ClientPhoneActionProps) {
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);

  const handlePhoneClick = () => {
    if (phone) {
      setIsCallDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-start gap-3">
        <Phone className="w-5 h-5 text-zinc-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-zinc-500">Phone</p>
          {phone ? (
            <button 
              onClick={handlePhoneClick}
              className="text-white hover:underline text-left break-all"
            >
              {phone}
            </button>
          ) : (
            <p className="text-white">—</p>
          )}
        </div>
      </div>
      
      <CallOutcomeDialog
        open={isCallDialogOpen}
        onOpenChange={setIsCallDialogOpen}
        targetType="CLIENT"
        targetId={clientId}
      />
    </>
  );
}
