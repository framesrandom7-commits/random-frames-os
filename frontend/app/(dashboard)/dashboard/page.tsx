import React from "react";
import Topbar from "@/components/dashboard/topbar";
import StatCard from "@/components/dashboard/stat-card";
import { Users, UserCircle, Briefcase, DollarSign, Camera, TrendingDown, AlertCircle } from "lucide-react";
import { getDashboardData } from "@/app/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueTrendChart, LeadFunnelChart, MonthlyProfitChart } from "@/components/reports/charts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { metrics, chartData } = await getDashboardData();

  const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <>
      <Topbar title="Business Dashboard" />
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

        <div className="mt-8 grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {/* Revenue Trend - Takes 2 columns on extra large screens */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Revenue & Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueTrendChart data={chartData.revenueTrend} />
            </CardContent>
          </Card>
          
          {/* Monthly Profit */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Monthly Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyProfitChart data={chartData.revenueTrend} />
            </CardContent>
          </Card>

          {/* Lead Funnel */}
          <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg xl:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Lead Conversion Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <LeadFunnelChart data={chartData.leadFunnel} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
