import React from "react";
import { getLeads, getLeadStats } from "@/app/actions/lead";
import { getUsers } from "@/app/actions/user";
import {
  ModuleLayout,
  ModuleHeader,
  ModuleToolbar,
  ModuleContent,
  ModuleViewSwitcher,
  ModuleSummary,
  ModuleSummaryCard
} from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Users, FileText, CheckCircle, Clock, Plus } from "lucide-react";
import { LeadViewManager } from "@/components/leads/lead-view-manager";
import { getLeadFilters } from "@/components/leads/lead-config";
import LeadKanban from "@/components/leads/lead-kanban";
import LeadImportExport from "@/components/leads/lead-import-export";
import { AutoRefresh } from "@/components/ui/auto-refresh";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LeadsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.q === 'string' ? searchParams.q : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status as any : undefined;
  const priority = typeof searchParams.priority === 'string' ? searchParams.priority as any : undefined;
  const source = typeof searchParams.source === 'string' ? searchParams.source as any : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const size = typeof searchParams.size === 'string' ? parseInt(searchParams.size) : 50;
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : undefined;
  const sortOrder = searchParams.sortOrder === 'asc' ? 'asc' : 'desc';
  const archived = searchParams.archived === 'true';
  const view = typeof searchParams.view === 'string' ? searchParams.view : 'list';

  // Fetch data
  const { leads, total } = await getLeads({
    search,
    status,
    priority,
    source,
    page,
    limit: size,
    sortBy,
    sortOrder,
    archived
  });
  
  const stats = await getLeadStats();
  const users = await getUsers();
  const filters = getLeadFilters(users);

  return (
    <ModuleLayout>
      <AutoRefresh interval={5000} />
      <ModuleHeader 
        title="Leads" primaryAction={
          <Link href="?new=lead">
            <Button className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </Link>
        }
        secondaryActions={<LeadImportExport leads={leads} />}
      />
      <ModuleSummary className="lg:grid-cols-5">
        <ModuleSummaryCard 
          title="Total Leads" 
          value={stats?.totalAllTime || 0} 
          icon={<Users />} 
          trend={`${stats?.totalAllTimeTrend && stats.totalAllTimeTrend > 0 ? '+' : ''}${stats?.totalAllTimeTrend || 0}%`} 
          trendDirection={stats?.totalAllTimeTrend && stats.totalAllTimeTrend >= 0 ? "up" : "down"} 
        />
        <ModuleSummaryCard 
          title="Active Leads" 
          value={stats?.totalActive || 0} 
          icon={<Users />} 
          trend={`${stats?.totalActiveTrend && stats.totalActiveTrend > 0 ? '+' : ''}${stats?.totalActiveTrend || 0}%`} 
          trendDirection={stats?.totalActiveTrend && stats.totalActiveTrend >= 0 ? "up" : "down"} 
        />
        <ModuleSummaryCard 
          title="New This Month" 
          value={stats?.newThisMonth || 0} 
          icon={<FileText />} 
          trend={`${stats?.newThisMonthTrend && stats.newThisMonthTrend > 0 ? '+' : ''}${stats?.newThisMonthTrend || 0}%`} 
          trendDirection={stats?.newThisMonthTrend && stats.newThisMonthTrend >= 0 ? "up" : "down"} 
        />
        <ModuleSummaryCard 
          title="Converted" 
          value={stats?.wonThisMonth || 0} 
          icon={<CheckCircle />} 
          trend={`${stats?.conversionRate || 0}%`} 
          trendDirection="neutral" 
        />
        <ModuleSummaryCard 
          title="Follow-ups Today" 
          value={stats?.followUpsToday || 0} 
          icon={<Clock />} 
          trend="" 
          trendDirection="neutral" 
        />
      </ModuleSummary>

      <ModuleToolbar 
        searchPlaceholder="Search leads..."
        filters={filters}
        right={
          <ModuleViewSwitcher 
            views={[
              { id: "list", label: "List" },
              { id: "kanban", label: "Kanban" }
            ]} 
            defaultView="list" 
          />
        }
      />

      <ModuleContent>
        {view === "kanban" ? (
          <div className="h-[calc(100vh-350px)]">
            <LeadKanban leads={leads} />
          </div>
        ) : (
          <LeadViewManager leads={leads} isArchived={archived} total={total} />
        )}
      </ModuleContent>
    </ModuleLayout>
  );
}
