import React from "react";
import Topbar from "@/components/dashboard/topbar";
import StatCard from "@/components/dashboard/stat-card";
import RecentLeads from "@/components/dashboard/recent-leads";
import RecentClients from "@/components/dashboard/recent-clients";
import RecentActivities from "@/components/dashboard/recent-activities";
import TodaysSchedule from "@/components/dashboard/todays-schedule";
import CalendarPreview from "@/components/dashboard/calendar-preview";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingReminders from "@/components/dashboard/upcoming-reminders";
import UpcomingShoots from "@/components/dashboard/upcoming-shoots";
import { Users, UserCircle, Briefcase, DollarSign, Camera, TrendingDown, Clock, AlertCircle } from "lucide-react";
import { getDashboardMetrics, getChartData } from "@/app/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueTrendChart, LeadFunnelChart, MonthlyProfitChart } from "@/components/reports/charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [metrics, chartData] = await Promise.all([
    getDashboardMetrics(),
    getChartData()
  ]);

  const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#050505]">
        
        <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Leads" value={metrics.totalLeads.toString()} icon={Users} trend="" />
          <StatCard title="Active Clients" value={metrics.totalClients.toString()} icon={UserCircle} trend="" />
          <StatCard title="Projects" value={metrics.totalProjects.toString()} icon={Briefcase} trend="" />
          <StatCard title="Upcoming Shoots" value={metrics.totalShoots.toString()} icon={Camera} trend="" />
          
          <StatCard title="Revenue" value={formatCurr(metrics.totalRevenue)} icon={DollarSign} trend="" />
          <StatCard title="Expenses" value={formatCurr(metrics.totalExpenses)} icon={TrendingDown} trend="" />
          <StatCard title="Net Profit" value={formatCurr(metrics.netProfit)} icon={DollarSign} trend="" />
          <StatCard title="Outstanding" value={formatCurr(metrics.outstandingPayments)} icon={AlertCircle} trend="" />
        </div>

        <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Revenue & Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueTrendChart data={chartData.revenueTrend} />
              </CardContent>
            </Card>
            
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <RecentLeads />
              <RecentClients />
            </div>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Monthly Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyProfitChart data={chartData.revenueTrend} />
              </CardContent>
            </Card>

            <RecentActivities />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            <QuickActions />
            <TodaysSchedule />
            <CalendarPreview />
            <UpcomingReminders />
            <UpcomingShoots />
            
            <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Lead Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadFunnelChart data={chartData.leadFunnel} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
