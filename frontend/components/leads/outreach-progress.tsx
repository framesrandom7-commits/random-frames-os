"use client";

import React from "react";
import { CheckCircle2, Circle, Mail, AtSign, Phone } from "lucide-react";
import { Typography } from "@/components/ui/typography";

interface Activity {
  description: string;
  createdAt?: Date;
}

interface OutreachProgressProps {
  activities: Activity[];
}

export function OutreachProgress({ activities }: OutreachProgressProps) {
  // Analyze activities to determine progress
  let emailDone = false;
  let dmDone = false;
  let waDone = false;
  let callCount = 0;
  let lastCallOutcome = "";

  activities.forEach(activity => {
    const desc = activity.description.toLowerCase();
    if (desc.includes("logged email outreach")) emailDone = true;
    if (desc.includes("logged instagram dm outreach")) dmDone = true;
    if (desc.includes("logged whatsapp outreach")) waDone = true;
    if (desc.includes("call attempt:")) {
      callCount++;
      // Get the outcome part (e.g. "Call Attempt: Answered")
      const outcomeMatch = activity.description.match(/Call Attempt: (.*)/);
      if (outcomeMatch) {
        lastCallOutcome = outcomeMatch[1];
      }
    }
  });

  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-3 min-w-[220px]">
      <Typography variant="sectionTitle" className="mb-3 text-sm font-semibold">Outreach Progress</Typography>
      
      <div className="space-y-2">
        {/* Email */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{emailDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5 text-zinc-600" />}</div>
          <Mail className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
          <span className={`text-xs leading-tight ${emailDone ? 'text-white' : 'text-zinc-500'}`}>
            Email {emailDone ? 'Sent' : 'Pending'}
          </span>
        </div>

        {/* Instagram DM */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{dmDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5 text-zinc-600" />}</div>
          <AtSign className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
          <span className={`text-xs leading-tight ${dmDone ? 'text-white' : 'text-zinc-500'}`}>
            Instagram {dmDone ? 'Sent' : 'Pending'}
          </span>
        </div>

        {/* WhatsApp */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{waDone ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5 text-zinc-600" />}</div>
          <Phone className="w-3.5 h-3.5 text-green-400 mt-0.5" />
          <span className={`text-xs leading-tight ${waDone ? 'text-white' : 'text-zinc-500'}`}>
            WhatsApp {waDone ? 'Sent' : 'Pending'}
          </span>
        </div>

        {/* Phone Call */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{callCount > 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Circle className="w-3.5 h-3.5 text-zinc-600" />}</div>
          <Phone className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
          <div className="flex flex-col">
            <span className={`text-xs leading-tight ${callCount > 0 ? 'text-white' : 'text-zinc-500'}`}>
              Call {callCount > 0 ? `Attempted (${callCount})` : 'Pending'}
            </span>
            {callCount > 0 && lastCallOutcome && (
              <span className="text-xs text-zinc-400">Last: {lastCallOutcome}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
