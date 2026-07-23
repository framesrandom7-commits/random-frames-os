

import React from "react";
import RecentLeads from "@/components/dashboard/recent-leads";
import RecentClients from "@/components/dashboard/recent-clients";

export default function ContinueWorkingWidget() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">Continue Working</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentLeads />
        <RecentClients />
      </div>
    </div>
  );
}
