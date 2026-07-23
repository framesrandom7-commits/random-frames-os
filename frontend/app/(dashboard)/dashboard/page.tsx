import React from "react";
import Topbar from "@/components/dashboard/topbar";
import StatCard from "@/components/dashboard/stat-card";
import RecentLeads from "@/components/dashboard/recent-leads";
import UpcomingShoots from "@/components/dashboard/upcoming-shoots";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingReminders from "@/components/dashboard/upcoming-reminders";
import { Users, UserCircle, Briefcase, DollarSign } from "lucide-react";
import { getDashboardMetrics } from "@/app/actions/reports";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

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
          <StatCard title="Total Leads" value={metrics.totalLeads.toString()} icon={Users} trend="" />
          <StatCard title="Active Clients" value={metrics.totalClients.toString()} icon={UserCircle} trend="" />
          <StatCard title="Projects" value={metrics.totalProjects.toString()} icon={Briefcase} trend="" />
          <StatCard title="Revenue" value={formatCurr(metrics.totalRevenue)} icon={DollarSign} trend="" />
        </div>

        <div className="mt-8 grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <RecentLeads />
          </div>
          <div className="space-y-6">
            <UpcomingReminders />
            <UpcomingShoots />
            <QuickActions />
          </div>
        </div>
      </main>
    </>
  );
}
