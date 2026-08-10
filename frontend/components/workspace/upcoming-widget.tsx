import React from "react";
import Link from "next/link";
import { Calendar, Video, FileText, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { InteractiveUpcomingCalendar } from "./interactive-upcoming-calendar";
import { ShootService } from "@/domain/services/ShootService";
import { DeliverableService } from "@/domain/services/DeliverableService";

export default async function UpcomingWidget() {
  const shoots = await ShootService.getDashboardUpcomingShoots(50);
  const deliverables = await DeliverableService.getDashboardUpcomingDeliverables(50);

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
        <h2 className="text-sm font-black text-[#E53935] uppercase tracking-widest flex items-center gap-2">
          <Calendar className="w-4 h-4 relative -top-[1px]" /> Upcoming
        </h2>
        <Link href="/calendar" className="text-[10px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">
          View All
        </Link>
      </div>

      <div className="bg-[#171A21]/50 p-6 rounded-[24px] border border-white/5">
        <InteractiveUpcomingCalendar shoots={shoots as any} deliverables={deliverables as any} />
      </div>
    </div>
  );
}
