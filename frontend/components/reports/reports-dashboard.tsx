"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Camera, IndianRupee, Wallet, Target, Download, FileText, FileSpreadsheet } from "lucide-react";
import { RevenueTrendChart, LeadFunnelChart, SourcePieChart, ProjectDistributionChart } from "./charts";
import { TopClientsList, TopProjectsList, UpcomingDeliveriesList, OverdueInvoicesList } from "./top-lists";
import { getDashboardMetrics, getChartData, getTopLists, DateRangeFilter } from "@/app/actions/reports";
import { exportToCSV, exportToExcel, exportToPDF } from "@/lib/export";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const formatCurr = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

export default function ReportsDashboard() {
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  const [metrics, setMetrics] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [lists, setLists] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      
      let dateFilter: DateRangeFilter | undefined = undefined;
      const now = new Date();
      
      if (filter === "today") {
        const start = new Date(now.setHours(0,0,0,0));
        dateFilter = { startDate: start, endDate: new Date(now.setHours(23,59,59,999)) };
      } else if (filter === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        dateFilter = { startDate: start, endDate: new Date() };
      } else if (filter === "month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { startDate: start, endDate: new Date() };
      } else if (filter === "lastMonth") {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        dateFilter = { startDate: start, endDate: end };
      } else if (filter === "year") {
        const start = new Date(now.getFullYear(), 0, 1);
        dateFilter = { startDate: start, endDate: new Date() };
      }

      const [metricsData, chartsData, listsData] = await Promise.all([
        getDashboardMetrics(dateFilter),
        getChartData(dateFilter),
        getTopLists(dateFilter)
      ]);

      setMetrics(metricsData);
      setCharts(chartsData);
      setLists(listsData);
      setIsLoading(false);
    }

    loadData();
  }, [filter]);

  const handleExportCSV = () => {
    if (!lists) return;
    exportToCSV(lists.topClients, "top_clients_report");
  };

  const handleExportExcel = () => {
    if (!lists) return;
    exportToExcel(lists.topProjects, "top_projects_report");
  };

  const handleExportPDF = () => {
    exportToPDF("reports-dashboard", "Random_Frames_OS_Report");
  };

  return (
    <div className="flex flex-col h-full space-y-6" id="reports-dashboard">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v || "all")}>
            <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-white">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-[#C1121F] hover:bg-[#a00f1a] text-white h-9 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
            <Download className="h-4 w-4 mr-2" /> Export Report
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-zinc-200 w-48">
            <DropdownMenuItem onClick={handleExportPDF} className="hover:bg-white/10 hover:text-white cursor-pointer">
              <FileText className="h-4 w-4 mr-2" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel} className="hover:bg-white/10 hover:text-white cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-400" /> Export as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} className="hover:bg-white/10 hover:text-white cursor-pointer">
              <FileText className="h-4 w-4 mr-2 text-blue-400" /> Export as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading || !metrics ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#C1121F]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
            <MetricCard title="Total Leads" value={metrics.totalLeads} icon={<Target />} />
            <MetricCard title="Win Rate" value={`${metrics.conversionRate.toFixed(1)}%`} icon={<Target />} highlight />
            <MetricCard title="Total Clients" value={metrics.totalClients} icon={<Users />} />
            <MetricCard title="Completed Projects" value={metrics.completedProjects} icon={<Briefcase />} />
            <MetricCard title="Total Shoots" value={metrics.totalShoots} icon={<Camera />} />
            <MetricCard title="Net Profit" value={formatCurr(metrics.netProfit)} icon={<IndianRupee />} className={metrics.netProfit >= 0 ? "text-emerald-400" : "text-red-400"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Total Revenue" value={formatCurr(metrics.totalRevenue)} icon={<IndianRupee />} className="text-emerald-400 bg-emerald-500/5 border-emerald-500/20" />
            <MetricCard title="Total Expenses" value={formatCurr(metrics.totalExpenses)} icon={<Wallet />} className="text-red-400 bg-red-500/5 border-red-500/20" />
            <MetricCard title="Outstanding" value={formatCurr(metrics.outstandingPayments)} icon={<IndianRupee />} className="text-amber-400 bg-amber-500/5 border-amber-500/20" />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white text-lg">Revenue vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueTrendChart data={charts.revenueTrend} />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Lead Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadFunnelChart data={charts.leadFunnel} />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Lead Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <SourcePieChart data={charts.sourceDistribution} />
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectDistributionChart data={charts.projectDistribution} />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Payment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectDistributionChart data={charts.paymentDistribution} />
              </CardContent>
            </Card>
          </div>

          {/* Top Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Clients by Revenue</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TopClientsList clients={lists.topClients} />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Most Profitable Projects</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <TopProjectsList projects={lists.topProjects} />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Upcoming Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <UpcomingDeliveriesList deliveries={lists.upcomingDeliveries} />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-red-400 text-lg">Overdue Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <OverdueInvoicesList invoices={lists.overdueInvoices} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon, highlight, className }: { title: string; value: string | number; icon: React.ReactNode; highlight?: boolean; className?: string }) {
  return (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-[#C1121F]/10 border-[#C1121F]/20' : className ? className : 'bg-white/5 border-white/10'} backdrop-blur-md flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-medium text-zinc-400">{title}</p>
        <div className={`p-1.5 rounded-md flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 ${highlight ? 'bg-[#C1121F]/20 text-[#C1121F]' : 'bg-white/10 text-zinc-400'}`}>
          {icon}
        </div>
      </div>
      <h3 className={`text-2xl font-bold ${highlight ? 'text-[#C1121F]' : className ? '' : 'text-white'}`}>{value}</h3>
    </div>
  );
}
