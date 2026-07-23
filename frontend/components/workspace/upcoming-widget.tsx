

import React from "react";
import CalendarPreview from "@/components/dashboard/calendar-preview";
import UpcomingShoots from "@/components/dashboard/upcoming-shoots";

export default function UpcomingWidget() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">Upcoming</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CalendarPreview />
        <UpcomingShoots />
      </div>
    </div>
  );
}
