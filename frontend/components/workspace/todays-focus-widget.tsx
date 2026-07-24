import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertCircle, Calendar, FileText, CheckCircle, ArrowRight } from "lucide-react";

const CardHeader = ({ title, count, colorClass, Icon }: any) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${colorClass}`} />
      <h3 className={`text-sm font-semibold tracking-wide ${colorClass}`}>{title}</h3>
    </div>
    <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-zinc-300 border border-white/5">
      {count}
    </div>
  </div>
);

export default async function TodaysFocusWidget() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  // 1. Action Required (Leads)
  const leads = await prisma.lead.findMany({
    where: { 
      status: { in: ["NEW", "ATTENDED"] }, 
      createdAt: { gte: sevenDaysAgo } 
    },
    take: 3,
  });

  // 2. Today's Schedule
  const events = await prisma.calendarEvent.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    orderBy: { startTime: "asc" },
    take: 3,
  });

  // 3. Today's Deliverables
  const deliverables = await prisma.deliverable.findMany({
    where: { 
      dueDate: { lt: tomorrow },
      status: { in: ["PENDING", "EDITING"] }
    },
    include: { shoot: { include: { project: true } } },
    take: 3,
  });

  // 4. Today's Reviews
  const reviews = await prisma.deliverable.findMany({
    where: {
      status: { in: ["READY_FOR_REVIEW", "CHANGES_REQUESTED"] }
    },
    include: { shoot: { include: { project: true } } },
    take: 3,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Card 1: Action Required */}
      <div className="flex flex-col p-5 bg-[#171A21]/80 backdrop-blur-md rounded-[24px] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(229,57,53,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E53935]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-[24px]" />
        
        <CardHeader title="Action Required" count={leads.length} colorClass="text-[#E53935]" Icon={AlertCircle} />
        
        <div className="flex-1 space-y-4">
          {leads.length === 0 ? (
            <p className="text-xs text-zinc-500 font-medium">No actions required.</p>
          ) : (
            leads.map(lead => (
              <div key={lead.id} className="group/item cursor-pointer">
                <Link href={`/leads/${lead.id}`}>
                  <h4 className="text-sm font-medium text-white group-hover/item:text-[#E53935] transition-colors truncate">{lead.businessName}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{lead.status.replace(/_/g, " ")}</p>
                </Link>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/5">
          <Link href="/leads" className="text-xs font-medium text-[#E53935] hover:text-[#EF5350] transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 2: Today's Schedule */}
      <div className="flex flex-col p-5 bg-[#171A21]/80 backdrop-blur-md rounded-[24px] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-[24px]" />
        
        <CardHeader title="Today's Schedule" count={events.length} colorClass="text-[#3B82F6]" Icon={Calendar} />
        
        <div className="flex-1 space-y-4">
          {events.length === 0 ? (
            <p className="text-xs text-zinc-500 font-medium">Schedule is clear.</p>
          ) : (
            events.map(event => (
              <div key={event.id} className="group/item cursor-pointer">
                <Link href="/calendar">
                  <h4 className="text-sm font-medium text-white group-hover/item:text-[#3B82F6] transition-colors truncate">{event.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                    {event.startTime || "All Day"} {event.endTime && `- ${event.endTime}`}
                  </p>
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <Link href="/calendar" className="text-xs font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors flex items-center gap-1">
            View calendar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 3: Today's Deliverables */}
      <div className="flex flex-col p-5 bg-[#171A21]/80 backdrop-blur-md rounded-[24px] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(245,158,11,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-[24px]" />
        
        <CardHeader title="Today's Deliverables" count={deliverables.length} colorClass="text-[#F59E0B]" Icon={FileText} />
        
        <div className="flex-1 space-y-4">
          {deliverables.length === 0 ? (
            <p className="text-xs text-zinc-500 font-medium">No deliverables due today.</p>
          ) : (
            deliverables.map((d: any) => (
              <div key={d.id} className="group/item cursor-pointer">
                <Link href={`/shoots/${d.shootId}`}>
                  <h4 className="text-sm font-medium text-white group-hover/item:text-[#F59E0B] transition-colors truncate">
                    {d.shoot?.project?.title || "Deliverable"}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{d.type}</p>
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <Link href="/projects" className="text-xs font-medium text-[#F59E0B] hover:text-[#FBBF24] transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 4: Today's Reviews */}
      <div className="flex flex-col p-5 bg-[#171A21]/80 backdrop-blur-md rounded-[24px] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.1)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-[24px]" />
        
        <CardHeader title="Today's Reviews" count={reviews.length} colorClass="text-[#10B981]" Icon={CheckCircle} />
        
        <div className="flex-1 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-zinc-500 font-medium">No pending reviews.</p>
          ) : (
            reviews.map((r: any) => (
              <div key={r.id} className="group/item cursor-pointer">
                <Link href={`/shoots/${r.shootId}`}>
                  <h4 className="text-sm font-medium text-white group-hover/item:text-[#10B981] transition-colors truncate">
                    {r.shoot?.project?.title || "Deliverable Review"}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{r.type}</p>
                </Link>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <Link href="/projects" className="text-xs font-medium text-[#10B981] hover:text-[#34D399] transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

    </div>
  );
}
