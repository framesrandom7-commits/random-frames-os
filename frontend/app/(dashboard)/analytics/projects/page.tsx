import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { getProjectAnalytics } from '@/app/actions/analytics';
import { KpiCard } from '@/components/analytics/kpi-card';
import { PieChart } from '@/components/analytics/pie-chart';
import { Briefcase, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ProjectAnalyticsPage() {
  const response = await getProjectAnalytics();
  const data = response.data;

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Project Analytics" />
        <div className="text-zinc-500">Failed to load project analytics. Ensure you have the required permissions.</div>
      </div>
    );
  }

  const { projects, tasks } = data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Project & Productivity Analytics" 
        subtitle="Track project efficiency and task completion"
        action={
          <Link href="/analytics">
            <Button variant="outline" className="border-white/10 text-white">
              Back to Overview
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Projects" 
          value={projects.totalProjects} 
          icon={<Briefcase size={16} />} 
        />
        <KpiCard 
          title="Completed Projects" 
          value={projects.completedProjects} 
          icon={<CheckCircle2 size={16} />} 
        />
        <KpiCard 
          title="Task Completion Rate" 
          value={tasks.completionRate} 
          formatter="percent"
          icon={<Clock size={16} />} 
        />
        <KpiCard 
          title="Overdue Tasks" 
          value={tasks.overdueTasks} 
          icon={<AlertCircle size={16} className="text-rose-500" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart 
          title="Project Status Overview" 
          description="Distribution of active and completed projects"
          data={projects.statusDistribution} 
        />
      </div>
    </div>
  );
}
