import React from "react";
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  [LeadStatus.NEW]: { label: "New", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" },
  [LeadStatus.ATTENDED]: { label: "Attended", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20" },
  [LeadStatus.REQUIREMENT_DISCUSSION]: { label: "Requirements", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20" },
  [LeadStatus.QUOTATION_SENT]: { label: "Quotation Sent", className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20" },
  [LeadStatus.NEGOTIATION]: { label: "Negotiation", className: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20" },
  [LeadStatus.QUOTATION_ACCEPTED]: { label: "Quotation Accepted", className: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" },
  [LeadStatus.CLIENT_FORM_SENT]: { label: "Client Form Sent", className: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/20" },
  [LeadStatus.CLIENT_FORM_RECEIVED]: { label: "Client Form Received", className: "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 border-teal-500/20" },
  [LeadStatus.CONVERTED_TO_CLIENT]: { label: "Converted", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" },
  [LeadStatus.PROJECT_CREATED]: { label: "Project Created", className: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20" },
  [LeadStatus.FIRST_SHOOT_SCHEDULED]: { label: "Shoot Scheduled", className: "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/20" },
  [LeadStatus.COMPLETED]: { label: "Completed", className: "bg-slate-500/10 text-slate-300 hover:bg-slate-500/20 border-slate-500/20" },
  [LeadStatus.CLOSED_LOST]: { label: "Lost", className: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20" },
};

export default function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium transition-colors", config?.className, className)}>
      {config?.label || status}
    </Badge>
  );
}
