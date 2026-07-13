import React from "react";
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  [LeadStatus.NEW]: { label: "New", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" },
  [LeadStatus.CONTACTED]: { label: "Contacted", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20" },
  [LeadStatus.FOLLOW_UP]: { label: "Follow Up", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20" },
  [LeadStatus.QUOTATION_SENT]: { label: "Quotation Sent", className: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20" },
  [LeadStatus.NEGOTIATION]: { label: "Negotiation", className: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20" },
  [LeadStatus.WON]: { label: "Won", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" },
  [LeadStatus.LOST]: { label: "Lost", className: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20" },
};

export default function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-medium transition-colors", config?.className, className)}>
      {config?.label || status}
    </Badge>
  );
}
