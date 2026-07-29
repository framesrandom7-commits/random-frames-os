import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Video, FileText, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { InteractiveCalendarPreview } from "./interactive-calendar-preview";

export default async function UpcomingWidget() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 14); // Next 14 days for more data

  // 1. Fetch Upcoming Shoots
  const shoots = await prisma.shoot.findMany({
    where: { 
      date: { gt: today, lte: nextWeek },
      status: { in: ["PLANNED", "CONFIRMED"] }
    },
    include: { project: true },
    orderBy: { date: "asc" },
    take: 3
  });

  // 2. Fetch Upcoming Deliverables
  const deliverables = await prisma.deliverable.findMany({
    where: { 
      dueDate: { gt: today, lte: nextWeek },
      status: { notIn: ["DELIVERED"] }
    },
    include: { shoot: { include: { project: true } } },
    orderBy: { dueDate: "asc" },
    take: 3
  });

  const getDay = (date: Date) => date.getDate();
  const getMonth = (date: Date) => date.toLocaleDateString('en-US', { month: 'short' });
  const getTime = (timeStr?: string | null) => timeStr || "TBD";

  const renderSectionHeader = (title: string, Icon: any, color: string) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[#E53935] uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-4 h-4 relative -top-[1px]" /> Upcoming
        </h2>
        <Link href="/calendar" className="text-[10px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8 bg-[#171A21]/50 p-6 rounded-[24px] border border-white/5">
        
        {/* Interactive Calendar Preview */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Calendar Preview</h3>
          <InteractiveCalendarPreview />
        </div>

        {/* Compact Lists */}
        <div className="space-y-6">
          
          {/* Shoots */}
          <div>
            {renderSectionHeader("Upcoming Shoots", Video, "text-[#F59E0B]")}
            <div className="space-y-3">
              {shoots.length === 0 ? <p className="text-xs text-zinc-500">No upcoming shoots.</p> : shoots.map(shoot => (
                <div key={shoot.id} className="flex gap-3 group">
                  <span className="text-[10px] text-zinc-600 mt-0.5">•</span>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{shoot.title}</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {shoot.date ? `${getDay(shoot.date)} ${getMonth(shoot.date)}` : "TBD"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div>
            {renderSectionHeader("Upcoming Deliverables", FileText, "text-[#3B82F6]")}
            <div className="space-y-3">
              {deliverables.length === 0 ? <p className="text-xs text-zinc-500">No upcoming deliverables.</p> : deliverables.map((d: any) => (
                <div key={d.id} className="flex gap-3 group">
                  <span className="text-[10px] text-zinc-600 mt-0.5">•</span>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {d.type}
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {d.dueDate ? `${getDay(d.dueDate)} ${getMonth(d.dueDate)}` : "TBD"}
                      {d.shoot?.project?.title && ` • ${d.shoot.project.title}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
