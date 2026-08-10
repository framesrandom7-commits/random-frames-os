"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Video, FileText } from "lucide-react";

interface Shoot {
  id: string;
  title: string;
  date: Date | null;
}

interface Deliverable {
  id: string;
  type: string;
  dueDate: Date | null;
  shoot?: {
    project?: {
      title: string;
    } | null;
  } | null;
}

interface Props {
  shoots: Shoot[];
  deliverables: Deliverable[];
}

export function InteractiveUpcomingCalendar({ shoots, deliverables }: Props) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getDay = (d: Date) => d.getDate();
  const getMonth = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });

  const renderSectionHeader = (title: string, Icon: any, color: string) => (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-3.5 h-3.5 ${color}`} />
      <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
    </div>
  );

  // Helper to check if two dates are the same calendar day
  const isSameDay = (d1: Date | null, d2: Date | undefined) => {
    if (!d1 || !d2) return false;
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const filteredShoots = shoots.filter(s => isSameDay(s.date, date));
  const filteredDeliverables = deliverables.filter(d => isSameDay(d.dueDate, date));

  // Determine which dates are "booked" for the calendar dots/highlights
  const bookedDates = shoots.map(s => s.date ? new Date(s.date) : null).filter(Boolean) as Date[];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-8">
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Calendar Preview</h3>
        <div className="bg-[#0F1115] rounded-[16px] p-2 border border-white/5 dark text-white">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              if (newDate) setDate(newDate);
            }}
            className="w-full flex justify-center !bg-transparent text-white"
            modifiers={{
              booked: bookedDates
            }}
            modifiersClassNames={{
              booked: "bg-[#E53935]/20 text-[#E53935] font-semibold rounded-full"
            }}
            classNames={{
              nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
              button_previous: "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white transition-opacity z-10 flex items-center justify-center",
              button_next: "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white transition-opacity z-10 flex items-center justify-center",
              day: "relative flex h-9 w-9 items-center justify-center p-0 font-normal text-zinc-300 aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-full transition-colors",
              today: "ring-1 ring-white/30 bg-white/5 text-white font-bold rounded-full",
              selected: "bg-[#E53935] text-white hover:bg-[#E53935] hover:text-white focus:bg-[#E53935] focus:text-white rounded-full font-bold shadow-md shadow-[#E53935]/20",
              outside: "text-zinc-600 opacity-50",
              weekday: "text-zinc-500 rounded-md w-9 font-medium text-[10px] uppercase",
            }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          {renderSectionHeader("Upcoming Shoots", Video, "text-[#F59E0B]")}
          <div className="space-y-3">
            {filteredShoots.length === 0 ? <p className="text-xs text-zinc-500">No upcoming shoots on this date.</p> : filteredShoots.map(shoot => (
              <div key={shoot.id} className="flex gap-3 group">
                <span className="text-[10px] text-zinc-600 mt-0.5">•</span>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{shoot.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {shoot.date ? `${getDay(new Date(shoot.date))} ${getMonth(new Date(shoot.date))}` : "TBD"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {renderSectionHeader("Upcoming Deliverables", FileText, "text-[#3B82F6]")}
          <div className="space-y-3">
            {filteredDeliverables.length === 0 ? <p className="text-xs text-zinc-500">No upcoming deliverables on this date.</p> : filteredDeliverables.map((d: any) => (
              <div key={d.id} className="flex gap-3 group">
                <span className="text-[10px] text-zinc-600 mt-0.5">•</span>
                <div>
                  <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                    {d.type}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {d.dueDate ? `${getDay(new Date(d.dueDate))} ${getMonth(new Date(d.dueDate))}` : "TBD"}
                    {d.shoot?.project?.title && ` • ${d.shoot.project.title}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
