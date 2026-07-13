import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import StatusBadge from "./status-badge";
import PriorityBadge from "./priority-badge";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { LeadListWithRelations } from "@/app/actions/lead";

export default function LeadCard({ lead }: { lead: LeadListWithRelations }) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-semibold text-white">{lead.businessName}</h4>
            <p className="text-sm text-zinc-400">{lead.contactPerson || "No contact"}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={lead.status} />
            <div className="flex items-center gap-1 text-amber-500 font-medium text-xs mt-1">
              <Star className="w-3 h-3 fill-current" />
              {lead.leadScore}
            </div>
          </div>
        </div>
        
        {lead.leadTags && lead.leadTags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {lead.leadTags.slice(0, 3).map(lt => (
              <Badge key={lt.tag.id} variant="outline" className="text-[10px] py-0 border-white/20 text-zinc-300">
                {lt.tag.name}
              </Badge>
            ))}
            {lead.leadTags.length > 3 && <span className="text-xs text-zinc-500">+{lead.leadTags.length - 3}</span>}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-500">{lead.phone || "No phone"}</span>
          <PriorityBadge priority={lead.priority} />
        </div>
      </CardContent>
    </Card>
  );
}
