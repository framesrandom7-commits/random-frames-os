import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getRevenueTrends, getExecutiveDashboard } from '@/app/actions/analytics';
import { KpiCard } from '@/components/analytics/kpi-card';
import { TrendChart } from '@/components/analytics/trend-chart';
import { DollarSign, BarChart3, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function FinanceAnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [trendsResponse, dashboardResponse] = await Promise.all([
    getRevenueTrends(currentYear),
    getExecutiveDashboard()
  ]);

  if (!trendsResponse.data || !dashboardResponse.data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Financial Analytics" />
        <div className="text-zinc-500">Failed to load financial analytics. Ensure you have the required permissions.</div>
      </div>
    );
  }

  const trends = trendsResponse.data;
  const { revenue, profit, outstandingPayments } = dashboardResponse.data.kpis;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Financial Analytics" 
        subtitle={`Revenue and cash flow trends for ${currentYear}`}
        action={
          <Link href="/analytics">
            <Button variant="outline" className="border-white/10 text-white">
              Back to Overview
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard 
          title="YTD Revenue" 
          value={revenue} 
          formatter="currency"
          icon={<DollarSign size={16} />} 
        />
        <KpiCard 
          title="YTD Profit" 
          value={profit} 
          formatter="currency"
          icon={<BarChart3 size={16} />} 
        />
        <KpiCard 
          title="Outstanding Payments" 
          value={outstandingPayments} 
          formatter="currency"
          icon={<CreditCard size={16} />} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TrendChart 
          title="Monthly Revenue vs Expenses" 
          description={`Cash flow visualization for ${currentYear}`}
          data={trends} 
          dataKey="profit" 
          categoryKey="month" 
          color="#3b82f6" 
        />
      </div>
    </div>
  );
}
