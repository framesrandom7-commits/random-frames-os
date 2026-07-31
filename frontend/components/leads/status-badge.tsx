import React from "react";
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { getLeadStatusMetadata } from "@/domain/lead/metadata";

export default function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = getLeadStatusMetadata(status);
  return (
    <Badge variant={meta?.variant || "outline"} className={cn("font-medium transition-colors", meta?.color, className)}>
      {meta?.label || status}
    </Badge>
  );
}
