import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getSalesAnalytics } from '@/app/actions/analytics';
import { KpiCard } from '@/components/analytics/kpi-card';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { PieChart } from '@/components/analytics/pie-chart';
import { Users, Target, ArrowRightCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function SalesAnalyticsPage({ searchParams }: { searchParams: Promise<{ startDate?: string, endDate?: string }> }) {
  const resolvedParams = await searchParams;
  const startDate = resolvedParams.startDate ? new Date(resolvedParams.startDate) : undefined;
  const endDate = resolvedParams.endDate ? new Date(resolvedParams.endDate) : undefined;
  const responseRaw = await getSalesAnalytics(startDate, endDate);
  const response = responseRaw as any;
  const data = response.data;

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Sales Analytics" />
        <div className="text-zinc-500">Failed to load sales analytics. Ensure you have the required permissions.</div>
      </div>
    );
  }

  const { funnel, sources } = data;
  
  // Extract key metrics from funnel
  const totalLeads = (funnel as any[]).find((f: any) => f.name === "Total Leads")?.value || 0;
  const converted = (funnel as any[]).find((f: any) => f.name === "Converted")?.value || 0;
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Sales Analytics" 
        subtitle="Track lead sources and conversion rates"
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
          title="Total Leads" 
          value={totalLeads} 
          icon={<Users size={16} />} 
        />
        <KpiCard 
          title="Converted Clients" 
          value={converted} 
          icon={<Target size={16} />} 
        />
        <KpiCard 
          title="Conversion Rate" 
          value={conversionRate} 
          formatter="percent"
          icon={<ArrowRightCircle size={16} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConversionFunnel 
          title="Sales Pipeline Funnel" 
          description="Progression of leads through stages"
          data={funnel} 
          color="#10b981" 
        />
        <PieChart 
          title="Lead Sources" 
          description="Where are your leads coming from?"
          data={sources} 
        />
      </div>
    </div>
  );
}
