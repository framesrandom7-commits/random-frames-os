"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MessageCircle, Eye, Edit, RotateCcw, Trash2, Phone, Mail } from "lucide-react";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import StatusBadge from "./status-badge";
import PriorityBadge from "./priority-badge";
import { LeadListWithRelations } from "@/app/actions/lead";
import { ColumnDef } from "@/components/ui/module";
import { useRouter } from "next/navigation";
import { Typography } from "@/components/ui/typography";

export function useLeadColumns({
  onEdit,
  onDelete,
  onRestore,
  isArchived
}: {
  onEdit: (lead: LeadListWithRelations) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  isArchived: boolean;
}) {
  const router = useRouter();

  const columns: ColumnDef<LeadListWithRelations>[] = [
    {
      header: "Business / Tags",
      accessorKey: "businessName",
      cell: (lead) => (
        <div>
          <div className="font-medium text-white">{lead.businessName}</div>
          {lead.leadTags && lead.leadTags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {lead.leadTags.slice(0, 2).map((lt) => (
                <Badge key={lt.tag.id} variant="outline" className="text-[10px] py-0 border-white/20 text-zinc-300">
                  {lt.tag.name}
                </Badge>
              ))}
              {lead.leadTags.length > 2 && <span className="text-xs text-zinc-500">+{lead.leadTags.length - 2}</span>}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Contact",
      accessorKey: "contactPerson",
      cell: (lead) => (
        <div>
          <div className="text-zinc-300 text-sm">{lead.contactPerson || "-"}</div>
          <div className="text-zinc-500 text-xs">{lead.email || lead.phone}</div>
        </div>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (lead) => <StatusBadge status={lead.status} />
    },
    {
      header: "Priority",
      accessorKey: "priority",
      cell: (lead) => <PriorityBadge priority={lead.priority} />
    },
    {
      header: "Score",
      accessorKey: "leadScore",
      cell: (lead) => (
        <div className="flex items-center gap-1 text-amber-500 font-medium">
          <Star className="w-3 h-3 fill-current" />
          {lead.leadScore}
        </div>
      )
    },
    {
      header: "Owner",
      accessorKey: "owner",
      cell: (lead) => (
        <div className="text-zinc-300 text-sm">
          {lead.owner?.name || lead.owner?.email || "Unassigned"}
        </div>
      )
    },
    {
      header: "Created Date",
      accessorKey: "createdAt",
      cell: (lead) => (
        <div className="text-zinc-300 text-sm">
          {new Date(lead.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      header: "Reminder",
      cell: (lead) => (
        <div className="text-zinc-400 text-sm">
          {lead.reminders && lead.reminders.length > 0 ? (
            <>
              {new Date(lead.reminders[0].date).toLocaleDateString()}
              {lead.reminders[0].time && <span className="text-xs ml-1 text-zinc-500">{lead.reminders[0].time}</span>}
            </>
          ) : "Not set"}
        </div>
      )
    },
    {
      header: "",
      className: "text-right",
      cell: (lead) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {lead.phone && (
            <a 
              href={whatsappLinks.generalMessage(lead.phone, `Hi ${lead.contactPerson || lead.businessName},\n\n`)} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10" title="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </a>
          )}
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); router.push(`/leads/${lead.id}`); }} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
          {!isArchived && (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(lead); }} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isArchived ? (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRestore(lead.id); }} className="h-8 w-8 text-zinc-400 hover:text-green-500 hover:bg-green-500/10" title="Restore">
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }} className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-500/10" title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  const cardRender = (lead: LeadListWithRelations) => (
    <div 
      className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-3 cursor-pointer hover:border-white/20 transition-colors"
      onClick={() => router.push(`/leads/${lead.id}`)}
    >
      <div className="flex justify-between items-start">
        <div>
          <Typography variant="cardTitle">{lead.businessName}</Typography>
          {lead.contactPerson && <Typography variant="caption" color="muted">{lead.contactPerson}</Typography>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={lead.status} />
          <PriorityBadge priority={lead.priority} />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center text-xs text-zinc-400">
        {lead.phone && (
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" /> {lead.phone}
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" /> {lead.email}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-1">
        <div className="flex items-center gap-1 text-amber-500 font-medium text-xs">
          <Star className="w-3 h-3 fill-current" /> {lead.leadScore} Score
        </div>
        <div className="flex gap-1">
          {!isArchived && (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(lead); }} className="h-8 w-8 text-zinc-400">
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isArchived ? (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRestore(lead.id); }} className="h-8 w-8 text-zinc-400 text-green-500">
              <RotateCcw className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }} className="h-8 w-8 text-zinc-400 text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return { columns, cardRender };
}
