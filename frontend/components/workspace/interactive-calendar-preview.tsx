"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export function InteractiveCalendarPreview() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="bg-[#0F1115] rounded-[16px] p-2 border border-white/5 dark text-white">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full flex justify-center !bg-transparent text-white"
        modifiers={{
          booked: [
            new Date(new Date().setDate(new Date().getDate() + 2)),
            new Date(new Date().setDate(new Date().getDate() + 5)),
            new Date(new Date().setDate(new Date().getDate() + 12)),
          ]
        }}
        modifiersClassNames={{
          booked: "bg-[#E53935]/20 text-[#E53935] font-semibold rounded-full"
        }}
        classNames={{
          nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          button_previous: "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white transition-opacity z-10 flex items-center justify-center",
          button_next: "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white transition-opacity z-10 flex items-center justify-center",
          day: "relative flex h-9 w-9 items-center justify-center p-0 font-normal text-zinc-300 aria-selected:opacity-100 hover:bg-white/10 hover:text-white rounded-full transition-colors",
          today: "bg-white/5 text-white rounded-full",
          selected: "bg-[#E53935] text-white hover:bg-[#E53935] hover:text-white focus:bg-[#E53935] focus:text-white rounded-full font-bold shadow-md shadow-[#E53935]/20",
          outside: "text-zinc-600 opacity-50",
          weekday: "text-zinc-500 rounded-md w-9 font-medium text-[10px] uppercase",
        }}
      />
    </div>
  );
}
