import React from "react";
import { Users, UserCircle, Briefcase, DollarSign, Camera, TrendingDown, AlertCircle } from "lucide-react";
import { getDashboardData } from "@/app/actions/reports";
import { RevenueTrendChart, LeadFunnelChart, MonthlyProfitChart } from "@/components/reports/charts";
import StatCard from "@/components/dashboard/stat-card";
import UpcomingShoots from "@/components/dashboard/upcoming-shoots";
import PendingDeliverables from "@/components/dashboard/pending-deliverables";
import { PageHeader } from "@/components/layout/page-header";
import { PremiumCard } from "@/components/ui/premium-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { metrics, chartData } = await getDashboardData();

  const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Business Analytics & Insights" 
        className="pb-2"
      />
      
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Leads" value={metrics.totalLeads.toString()} icon={Users} trend="" />
        <StatCard title="Active Clients" value={metrics.totalClients.toString()} icon={UserCircle} trend="" />
        <StatCard title="Projects" value={metrics.totalProjects.toString()} icon={Briefcase} trend="" />
        <StatCard title="Upcoming Shoots" value={metrics.totalShoots.toString()} icon={Camera} trend="" />
        
        <StatCard title="Revenue" value={formatCurr(metrics.totalRevenue)} icon={DollarSign} trend="" />
        <StatCard title="Expenses" value={formatCurr(metrics.totalExpenses)} icon={TrendingDown} trend="" />
        <StatCard title="Net Profit" value={formatCurr(metrics.netProfit)} icon={DollarSign} trend="" />
        <StatCard title="Outstanding" value={formatCurr(metrics.outstandingPayments)} icon={AlertCircle} trend="" />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Revenue Trend */}
        <PremiumCard className="xl:col-span-2 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Revenue & Expenses Trend</h3>
          <div className="flex-1">
            <RevenueTrendChart data={chartData.revenueTrend} />
          </div>
        </PremiumCard>
        
        {/* Monthly Profit */}
        <PremiumCard className="p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Monthly Net Profit</h3>
          <div className="flex-1">
            <MonthlyProfitChart data={chartData.revenueTrend} />
          </div>
        </PremiumCard>

        {/* Lead Funnel */}
        <PremiumCard className="xl:col-span-3 p-6 flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-white">Lead Conversion Funnel</h3>
          <div className="h-[300px]">
            <LeadFunnelChart data={chartData.leadFunnel} />
          </div>
        </PremiumCard>

        {/* Operational Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:col-span-3">
          <PremiumCard className="overflow-hidden h-[400px] flex flex-col">
            <UpcomingShoots />
          </PremiumCard>
          <PremiumCard className="overflow-hidden h-[400px] flex flex-col">
            <PendingDeliverables />
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
