

import React from "react";
import RecentActivities from "@/components/dashboard/recent-activities";

export default function RecentActivityWidget() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">Recent Activity</h2>
      <RecentActivities />
    </div>
  );
}
