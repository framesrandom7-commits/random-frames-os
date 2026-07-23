

import React from "react";
import TodaysSchedule from "@/components/dashboard/todays-schedule";
import UpcomingReminders from "@/components/dashboard/upcoming-reminders";

export default function TodaysFocusWidget() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">Today's Focus</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodaysSchedule />
        <UpcomingReminders />
      </div>
    </div>
  );
}
