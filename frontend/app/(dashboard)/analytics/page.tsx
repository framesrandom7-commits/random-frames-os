import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getExecutiveDashboard } from '@/app/actions/analytics';
import { ReportsService } from '@/domain/services/ReportsService';
import { KpiCard } from '@/components/analytics/kpi-card';
import { TrendChart } from '@/components/analytics/trend-chart';
import { ConversionFunnel } from '@/components/analytics/conversion-funnel';
import { PieChart } from '@/components/analytics/pie-chart';
import { IndianRupee, BarChart3, Briefcase, Users, ShieldAlert, CheckCircle, Mail, MessageSquare, HardDrive, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AnalyticsDashboardPage() {
  const [response, commandCenter] = await Promise.all([
    getExecutiveDashboard(),
    ReportsService.getFounderCommandCenter()
  ]);
  const data = response.data;

  if (!data || !commandCenter) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Analytics & Business Intelligence" />
        <div className="text-zinc-500">Failed to load analytics data. Ensure you have the required permissions.</div>
      </div>
    );
  }

  const { kpis, charts } = data;
  const { healthDiagnostic, executiveAlerts, verticalBreakdown, communicationAnalytics } = commandCenter;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Executive Command Center" />

      <div className="flex justify-between items-center bg-white/5 p-1 rounded-lg w-fit border border-white/10 mb-2">
        <div className="flex gap-1">
          <Link href="/analytics" className="px-4 py-1.5 rounded-md bg-white/10 text-white font-medium text-sm">
            Command Center
          </Link>
          <Link href="/analytics/sales" className="px-4 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            Sales & Leads
          </Link>
          <Link href="/analytics/finance" className="px-4 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            Financials
          </Link>
          <Link href="/analytics/projects" className="px-4 py-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-colors">
            Projects & Verticals
          </Link>
        </div>
      </div>

      {/* Automatic Executive Alerts Banner */}
      {executiveAlerts && executiveAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {executiveAlerts.map((alert: any) => (
            <div key={alert.id} className={`p-4 rounded-lg border flex flex-col justify-between ${alert.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30 text-red-200' : alert.severity === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' : 'bg-blue-500/10 border-blue-500/30 text-blue-200'}`}>
              <div className="flex items-center gap-2 mb-2 font-semibold text-sm">
                <ShieldAlert size={18} />
                <span>[{alert.category}] {alert.title}</span>
              </div>
              <p className="text-xs opacity-90 mb-2">{alert.description}</p>
              <div className="text-xs font-mono bg-white/5 p-2 rounded border border-white/10">
                👉 Action: {alert.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Business Health Score Card & Diagnostics */}
      <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-zinc-900 p-6 rounded-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-400" size={20} />
            <h2 className="text-lg font-bold text-white">Business Health Grade: <span className="text-emerald-400">{healthDiagnostic.grade}</span></h2>
          </div>
          <p className="text-sm text-zinc-300">Weighted composite analysis across Revenue Growth, Cash Reserves, Overdue Debt & Studio Delivery Speed.</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {healthDiagnostic.contributingFactors.map((f: any, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10 text-zinc-200">
                {f.factor}: <strong>{f.status}</strong> ({f.details})
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/40 p-4 rounded-full border border-white/10 min-w-[120px] min-h-[120px]">
          <span className="text-3xl font-extrabold text-emerald-400">{healthDiagnostic.score}</span>
          <span className="text-xs text-zinc-400 font-medium">OUT OF 100</span>
        </div>
      </div>

      {/* Atomic KPIs with Trend Indicators */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Total Revenue (YTD)" 
            value={kpis.revenue} 
            formatter="currency"
            icon={<IndianRupee size={16} />} 
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
            title="Active Projects Pipeline" 
            value={kpis.projectsActive} 
            icon={<Briefcase size={16} />} 
          />
        </div>

        {/* Google Workspace & WhatsApp Communication Analytics */}
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="text-indigo-400" size={18} />
            Integrated Workspace & WhatsApp Communication Telemetry
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <Mail className="mx-auto text-blue-400 mb-1" size={20} />
              <div className="text-2xl font-bold text-white">{communicationAnalytics.emailsDispatched}</div>
              <div className="text-xs text-zinc-400">Emails Dispatched</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <MessageSquare className="mx-auto text-emerald-400 mb-1" size={20} />
              <div className="text-2xl font-bold text-white">{communicationAnalytics.whatsappMessagesSent}</div>
              <div className="text-xs text-zinc-400">WhatsApp Billing Notices</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <Calendar className="mx-auto text-amber-400 mb-1" size={20} />
              <div className="text-2xl font-bold text-white">{communicationAnalytics.calendarMeetingsBooked}</div>
              <div className="text-xs text-zinc-400">Calendar Meet Rooms</div>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
              <HardDrive className="mx-auto text-purple-400 mb-1" size={20} />
              <div className="text-2xl font-bold text-white">{communicationAnalytics.driveAssetsCount}</div>
              <div className="text-xs text-zinc-400">Drive Delivery Assets</div>
            </div>
          </div>
        </div>

        {/* Service Vertical Analytics */}
        <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
          <h3 className="text-md font-semibold text-white mb-4">Service Performance Segmented by Business Verticals</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {verticalBreakdown.map((vert: any, idx: number) => (
              <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/5 text-center flex flex-col justify-between">
                <span className="font-semibold text-sm text-zinc-200">{vert.verticalName}</span>
                <span className="text-xl font-extrabold text-blue-400 mt-2">₹{Number(vert.revenue).toLocaleString('en-IN')}</span>
                <span className="text-xs text-zinc-400 mt-1">{vert.projectCount} Project(s) — {vert.percentageOfTotal}% Share</span>
              </div>
            ))}
          </div>
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
