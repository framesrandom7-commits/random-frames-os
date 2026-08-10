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
import { Users, FileText, CheckCircle, Clock } from "lucide-react";
import { LeadViewManager } from "@/components/leads/lead-view-manager";
import { getLeadFilters } from "@/components/leads/lead-config";
import LeadKanban from "@/components/leads/lead-kanban";
import LeadImportExport from "@/components/leads/lead-import-export";
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
      <ModuleHeader 
        title="Leads" primaryAction={
          <Link href="?new=lead">
            <Button className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">Add Lead</Button>
          </Link>
        }
        secondaryActions={<LeadImportExport leads={leads} />}
      />

      <ModuleSummary>
        <ModuleSummaryCard 
          title="Total Leads" 
          value={stats?.totalActive || 0} 
          icon={<Users />} 
          trend="+12%" 
          trendDirection="up" 
        />
        <ModuleSummaryCard 
          title="New This Month" 
          value={stats?.totalActive || 0} 
          icon={<FileText />} 
          trend="+5%" 
          trendDirection="up" 
        />
        <ModuleSummaryCard 
          title="Converted" 
          value={stats?.wonThisMonth || 0} 
          icon={<CheckCircle />} 
          trend="8%" 
          trendDirection="neutral" 
          comparison="conversion rate"
        />
        <ModuleSummaryCard 
          title="Avg. Response" 
          value="2.4h" 
          icon={<Clock />} 
          trend="-15m" 
          trendDirection="down" 
          comparison="vs last month"
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
