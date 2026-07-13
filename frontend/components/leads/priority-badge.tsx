import React from "react";
import { Badge } from "@/components/ui/badge";
import { LeadPriority } from "@prisma/client";
import { cn } from "@/lib/utils";

const priorityConfig: Record<LeadPriority, { label: string; className: string }> = {
  [LeadPriority.LOW]: { label: "Low", className: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20" },
  [LeadPriority.MEDIUM]: { label: "Medium", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" },
  [LeadPriority.HIGH]: { label: "High", className: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20" },
  [LeadPriority.URGENT]: { label: "Urgent", className: "bg-[#C1121F]/10 text-[#C1121F] hover:bg-[#C1121F]/20 border-[#C1121F]/20" },
};

export default function PriorityBadge({ priority, className }: { priority: LeadPriority; className?: string }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={cn("font-medium transition-colors", config?.className, className)}>
      {config?.label || priority}
    </Badge>
  );
}
