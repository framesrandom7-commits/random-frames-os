import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { getLeads, getLeadStats } from "@/app/actions/lead";
import LeadTable from "@/components/leads/lead-table";
import LeadKanban from "@/components/leads/lead-kanban";
import LeadDashboard from "@/components/leads/lead-dashboard";
import LeadImportExport from "@/components/leads/lead-import-export";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadToolbar from "@/components/leads/lead-toolbar";

export const dynamic = "force-dynamic";

export default async function LeadsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status as any : undefined;
  const priority = typeof searchParams.priority === 'string' ? searchParams.priority as any : undefined;
  const source = typeof searchParams.source === 'string' ? searchParams.source as any : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 50;
  const sortBy = typeof searchParams.sortBy === 'string' ? searchParams.sortBy : undefined;
  const sortOrder = searchParams.sortOrder === 'asc' ? 'asc' : 'desc';
  const archived = searchParams.archived === 'true';

  const { leads, total, totalPages } = await getLeads({
    search,
    status,
    priority,
    source,
    page,
    limit,
    sortBy,
    sortOrder,
    archived
  });
  const stats = await getLeadStats();

  return (
    <>
      <Topbar title="Leads" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">Leads Management</h2>
            <p className="text-sm text-zinc-400">Track and manage your potential clients</p>
          </div>
          
          <div className="flex items-center gap-3">
            <LeadImportExport leads={leads} />
            <LeadToolbar />
          </div>
        </div>
        
        {/* Dashboard at the top */}
        <div className="mb-8">
          <LeadDashboard stats={stats} />
        </div>
        
        <Tabs defaultValue="list" className="w-full space-y-6">
          <div className="flex justify-between items-center bg-white/5 p-1 rounded-lg w-fit border border-white/10">
            <TabsList className="bg-transparent text-zinc-400 h-9">
              <TabsTrigger value="list" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">List View</TabsTrigger>
              <TabsTrigger value="kanban" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Kanban Board</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="m-0 focus-visible:outline-none">
            <LeadTable leads={leads} page={page} totalPages={totalPages} total={total} />
          </TabsContent>

          <TabsContent value="kanban" className="m-0 focus-visible:outline-none h-[calc(100vh-250px)]">
            <LeadKanban leads={leads} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
