import React from "react";
import Topbar from "@/components/dashboard/topbar";
import StatCard from "@/components/dashboard/stat-card";
import RecentLeads from "@/components/dashboard/recent-leads";
import UpcomingShoots from "@/components/dashboard/upcoming-shoots";
import QuickActions from "@/components/dashboard/quick-actions";
import { Users, UserCircle, Briefcase, DollarSign } from "lucide-react";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mb-8 flex items-center text-sm text-zinc-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Dashboard</span>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Leads" value="124" icon={Users} trend="+12% from last month" />
          <StatCard title="Active Clients" value="45" icon={UserCircle} trend="+5% from last month" />
          <StatCard title="Projects" value="28" icon={Briefcase} trend="+2% from last month" />
          <StatCard title="Revenue" value="$42,500" icon={DollarSign} trend="+18% from last month" />
        </div>

        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentLeads />
          </div>
          <div className="space-y-6">
            <UpcomingShoots />
            <QuickActions />
          </div>
        </div>
      </main>
    </>
  );
}
