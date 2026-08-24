import React from "react";
import { getClients, getClientStats } from "@/app/actions/client";
import { BusinessType } from "@prisma/client";
import { ClientsModuleClient } from "@/components/clients/clients-module-client";

export const dynamic = "force-dynamic";

export default async function ClientsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const businessType = typeof searchParams.businessType === "string" ? searchParams.businessType as any : "";
  const archived = searchParams.archived === "true";
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : "createdAt";
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : "desc";

  const [statsData, clientsRaw] = await Promise.all([
    getClientStats(),
    getClients({ page, limit: 50, search, businessType, archived, sortBy, sortOrder })
  ]);
  const stats = JSON.parse(JSON.stringify(statsData, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  )) as any;
  // Serialize Prisma Decimal and BigInt objects before passing to Client Component
  const clientsData = JSON.parse(JSON.stringify(clientsRaw, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));

  return (
    <ClientsModuleClient
      data={clientsData.clients || []}
      total={clientsData.total || 0}
      stats={stats}
      currentView="list"
      currentPage={clientsData.currentPage || 1}
      totalPages={clientsData.totalPages || 1}
    />
  );
}
