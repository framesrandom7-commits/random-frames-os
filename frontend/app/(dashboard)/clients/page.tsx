import React, { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Users, Building, AlertCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients, getClientStats } from "@/app/actions/client";
import ClientTable from "@/components/clients/client-table";
import ClientSearch from "@/components/clients/client-search";
import ClientFilters from "@/components/clients/client-filters";
import AddClientButton from "@/components/clients/add-client-button";
import { BusinessType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const businessType = typeof searchParams.businessType === "string" ? searchParams.businessType as BusinessType : "";
  const archived = searchParams.archived === "true";
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "createdAt";
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : "desc";

  const [clientData, stats] = await Promise.all([
    getClients({ page, limit: 50, search, businessType, archived, sortBy, sortOrder }),
    getClientStats()
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Clients"
        subtitle="Manage your client relationships"
      />
      
      {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalClients}</div>
              <p className="text-xs text-zinc-500 mt-1">Total active clients in system</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">New This Month</CardTitle>
              <Building className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">+{stats.newClientsThisMonth}</div>
              <p className="text-xs text-zinc-500 mt-1">Clients onboarded this month</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Clients</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.activeClients}</div>
              <p className="text-xs text-zinc-500 mt-1">Currently engaged clients</p>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Inactive Clients</CardTitle>
              <AlertCircle className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-400">{stats.inactiveClients}</div>
              <p className="text-xs text-zinc-500 mt-1">Archived clients</p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-1 items-center gap-2">
            <ClientSearch />
            <ClientFilters />
          </div>
          <div className="flex items-center gap-2">
            <AddClientButton />
          </div>
        </div>

        {/* Client Table */}
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-zinc-500">Loading clients...</div>}>
          <ClientTable 
            clients={clientData.clients} 
            page={clientData.currentPage} 
            totalPages={clientData.totalPages} 
            total={clientData.total} 
          />
        </Suspense>
    </div>
  );
}
