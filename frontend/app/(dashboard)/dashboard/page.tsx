import React from "react";
import { Users, UserCircle, Briefcase, DollarSign, Camera, TrendingDown, AlertCircle, CalendarPlus, UserPlus, FilePlus, CreditCard, Calendar } from "lucide-react";
import { getDashboardData } from "@/app/actions/reports";
import { RevenueTrendChart, LeadFunnelChart, MonthlyProfitChart } from "@/components/reports/charts";
import UpcomingShoots from "@/components/dashboard/upcoming-shoots";
import PendingDeliverables from "@/components/dashboard/pending-deliverables";
import { DashboardLayout, DashboardContent } from "@/components/dashboard/layout/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard/layout/dashboard-header";
import { Widget } from "@/components/dashboard/layout/widget";
import { KpiCard } from "@/components/dashboard/components/kpi-card";
import { DashboardAnalytics } from "@/components/dashboard/components/dashboard-analytics";
import { QuickActions, QuickActionDef } from "@/components/dashboard/components/quick-actions";
import { ResponsiveFormGrid } from "@/components/ui/form/responsive-form-grid";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { metrics, chartData } = await getDashboardData();

  const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const quickActions: QuickActionDef[] = [
    { id: "create-lead", title: "Create Lead", description: "Add a new prospective client", icon: UserPlus, href: "?new=lead", shortcut: "L" },
    { id: "add-client", title: "Add Client", description: "Onboard a new client", icon: Users, href: "?new=client", shortcut: "C" },
    { id: "create-project", title: "Create Project", description: "Start a new project workflow", icon: Briefcase, href: "?new=project", shortcut: "P" },
    { id: "schedule-shoot", title: "Schedule Shoot", description: "Add a shoot to the calendar", icon: CalendarPlus, href: "?new=shoot", shortcut: "S" },
    { id: "create-invoice", title: "Create Invoice", description: "Draft a new invoice", icon: CreditCard, href: "/finance/invoices/new", shortcut: "I" },
    { id: "view-calendar", title: "View Calendar", description: "Open the master schedule", icon: Calendar, href: "/calendar" },
  ];

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Dashboard" primaryAction={<Button variant="primary">Generate Report</Button>}
      />
      
      <DashboardContent>
        {/* Quick Actions */}
        <div className="mb-2">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Actions</h2>
          <QuickActions actions={quickActions} />
        </div>

        {/* KPIs */}
        <ResponsiveFormGrid className="lg:grid-cols-4">
          <KpiCard title="Total Leads" value={metrics.totalLeads} icon={Users} trendDirection="neutral" />
          <KpiCard title="Active Clients" value={metrics.totalClients} icon={UserCircle} trendDirection="neutral" />
          <KpiCard title="Projects" value={metrics.totalProjects} icon={Briefcase} trendDirection="neutral" />
          <KpiCard title="Upcoming Shoots" value={metrics.totalShoots} icon={Camera} trendDirection="neutral" />
          
          <KpiCard title="Revenue" value={formatCurr(metrics.totalRevenue)} icon={DollarSign} trendDirection="up" trend="+15%" />
          <KpiCard title="Expenses" value={formatCurr(metrics.totalExpenses)} icon={TrendingDown} trendDirection="down" trend="-5%" />
          <KpiCard title="Net Profit" value={formatCurr(metrics.netProfit)} icon={DollarSign} trendDirection="up" trend="+20%" />
          <KpiCard title="Outstanding" value={formatCurr(metrics.outstandingPayments)} icon={AlertCircle} trendDirection="warning" trend="Action Needed" />
        </ResponsiveFormGrid>

        {/* Analytics Section */}
        <DashboardAnalytics>
          <Widget title="Revenue & Expenses Trend" className="xl:col-span-2">
            <div className="h-[300px]">
              <RevenueTrendChart data={chartData.revenueTrend} />
            </div>
          </Widget>
          
          <Widget title="Monthly Net Profit">
            <div className="h-[300px]">
              <MonthlyProfitChart data={chartData.revenueTrend} />
            </div>
          </Widget>

          <Widget title="Lead Conversion Funnel" className="xl:col-span-3">
            <div className="h-[300px]">
              <LeadFunnelChart data={chartData.leadFunnel} />
            </div>
          </Widget>
        </DashboardAnalytics>

        {/* Activity & Operational Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[400px]">
            <UpcomingShoots />
          </div>
          <div className="h-[400px]">
            <PendingDeliverables />
          </div>
        </div>
      </DashboardContent>
    </DashboardLayout>
  );
}
