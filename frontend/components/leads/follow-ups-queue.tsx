import React from "react";
import { prisma } from "@/lib/prisma";
import { Clock, Phone, ArrowRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";

export async function FollowUpsQueue() {
  const today = new Date();
  
  // Fetch followups due today (or overdue and still pending)
  const followUps = await prisma.followUp.findMany({
    where: {
      status: "PENDING",
      dueDate: {
        lte: endOfDay(today)
      }
    },
    include: {
      lead: true,
      client: true
    },
    orderBy: {
      dueDate: "asc"
    },
    take: 10 // Limit to top 10 for the UI
  });

  if (followUps.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-white text-lg font-medium flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[#C1121F]" />
        Today's Follow-ups
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followUps.map(followUp => {
          const targetName = followUp.lead?.businessName || followUp.lead?.contactPerson || followUp.client?.businessName || "Unknown";
          const targetLink = followUp.leadId ? `/leads/${followUp.leadId}` : (followUp.clientId ? `/clients/${followUp.clientId}` : "#");
          
          return (
            <Link key={followUp.id} href={targetLink} className="block group">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 hover:bg-zinc-900/80 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium truncate pr-2 group-hover:text-[#C1121F] transition-colors">{targetName}</h3>
                  <Badge variant="outline" className="bg-white/5 whitespace-nowrap">
                    {followUp.leadId ? "Lead" : "Client"}
                  </Badge>
                </div>
                
                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                  {followUp.title}
                </p>
                
                {followUp.description && (
                  <div className="bg-black/30 rounded px-2 py-1.5 text-xs text-zinc-300 mb-3 line-clamp-1 border border-white/5">
                    {followUp.description}
                  </div>
                )}
                
                <div className="flex items-center text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1">
                    Follow-up Due
                  </span>
                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[#C1121F]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
