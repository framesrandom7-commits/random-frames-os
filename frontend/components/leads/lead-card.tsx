import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "./status-badge";
import PriorityBadge from "./priority-badge";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { LeadListWithRelations } from "@/app/actions/lead";
import { LeadStatus } from "@prisma/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getLeadStatusMetadata } from "@/domain/lead/metadata";
import { cn } from "@/lib/utils";

const ALL_STATUSES = Object.values(LeadStatus);

export default function LeadCard({ 
  lead, 
  onStatusChange 
}: { 
  lead: LeadListWithRelations;
  onStatusChange?: (leadId: string, status: LeadStatus) => void;
}) {
  return (
    <Card className="border-white/5 bg-[#171A21] backdrop-blur-md transition-all hover:bg-white/5 group relative overflow-hidden shadow-sm hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
      
      <CardContent className="p-4 space-y-3 relative z-10">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white/90 truncate">{lead.businessName}</h4>
            <p className="text-sm text-zinc-400 truncate">{lead.contactPerson || "No contact"}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {onStatusChange ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="transition-transform hover:scale-105 cursor-pointer">
                    <StatusBadge status={lead.status} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#1A1D24] border-white/10">
                  {ALL_STATUSES.map((status) => {
                    const meta = getLeadStatusMetadata(status);
                    return (
                      <DropdownMenuItem 
                        key={status} 
                        onClick={() => onStatusChange(lead.id, status)}
                        className="cursor-pointer focus:bg-white/10"
                      >
                        <span className={cn("text-sm font-medium", meta?.color || "text-zinc-300")}>
                          {meta?.label || status}
                        </span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <StatusBadge status={lead.status} />
            )}
            
            <div className="flex items-center gap-1 text-amber-500/90 font-medium text-xs">
              <Star className="w-3 h-3 fill-current" />
              {lead.leadScore}
            </div>
          </div>
        </div>
        
        {lead.leadTags && lead.leadTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {lead.leadTags.slice(0, 3).map(lt => (
              <Badge key={lt.tag.id} variant="secondary" className="text-[10px] px-1.5 py-0 border-transparent bg-white/10 hover:bg-white/20 text-zinc-300">
                {lt.tag.name}
              </Badge>
            ))}
            {lead.leadTags.length > 3 && <span className="text-[10px] text-zinc-500 font-medium mt-0.5">+{lead.leadTags.length - 3}</span>}
          </div>
        )}

        <div className="flex justify-between items-center pt-1 border-t border-white/5">
          <span className="text-xs text-zinc-400 font-medium tracking-wide truncate pr-2">{lead.phone || "No phone"}</span>
          <PriorityBadge priority={lead.priority} />
        </div>
      </CardContent>
    </Card>
  );
}
