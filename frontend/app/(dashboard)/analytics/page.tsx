import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getExecutiveDashboard } from '@/app/actions/analytics';
import { KpiCard } from '@/components/analytics/kpi-card';
import { TrendChart } from '@/components/analytics/trend-chart';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { PieChart } from '@/components/analytics/pie-chart';
import { DollarSign, BarChart3, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboardPage() {
  const response = await getExecutiveDashboard();
  const data = response.data;

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics & Business Intelligence" />
        <div className="text-zinc-500">Failed to load analytics data. Ensure you have the required permissions.</div>
      </div>
    );
  }

  const { kpis, charts } = data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Executive Dashboard" 
        subtitle="High-level business intelligence and KPIs"
      />

      <div className="flex justify-between items-center bg-white/5 p-1 rounded-lg w-fit border border-white/10 mb-6">
        <div className="flex gap-1">
          <Link href="/analytics" className="px-4 py-1.5 rounded-md bg-white/10 text-white font-medium text-sm">
            Overview
          </Link>
          <Link href="/analytics/sales" className="px-4 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            Sales & Leads
          </Link>
          <Link href="/analytics/finance" className="px-4 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            Financials
          </Link>
          <Link href="/analytics/projects" className="px-4 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            Projects
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Revenue" 
            value={kpis.revenue} 
            formatter="currency"
            icon={<DollarSign size={16} />} 
          />
          <KpiCard 
            title="Net Profit" 
            value={kpis.profit} 
            formatter="currency"
            icon={<BarChart3 size={16} />} 
          />
          <KpiCard 
            title="Lead Conversion Rate" 
            value={kpis.conversionRate} 
            formatter="percent"
            icon={<Users size={16} />} 
          />
          <KpiCard 
            title="Active Projects" 
            value={kpis.projectsActive} 
            icon={<Briefcase size={16} />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart 
            title="Revenue Trends (Current Year)" 
            data={charts.revenueTrends} 
            dataKey="revenue" 
            categoryKey="month" 
            color="#3b82f6" 
          />
          <TrendChart 
            title="Expense Trends (Current Year)" 
            data={charts.revenueTrends} 
            dataKey="expenses" 
            categoryKey="month" 
            color="#ec4899" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConversionFunnel 
            title="Sales Funnel" 
            description="Lead progression across stages"
            data={charts.conversionFunnel} 
            color="#8b5cf6" 
          />
          <PieChart 
            title="Project Status Distribution" 
            data={charts.projectStatus} 
          />
        </div>
      </div>
    </div>
  );
}
