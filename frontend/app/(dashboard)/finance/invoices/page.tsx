import React from "react";
import { getInvoices } from "@/app/actions/invoice";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import InvoicesTable from "@/components/finance/invoices-table";
import { InvoiceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: {
    status?: InvoiceStatus;
    clientId?: string;
    projectId?: string;
    page?: string;
  };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  
  const [invoicesResponse, clientsResponse, projectsResponse] = await Promise.all([
    getInvoices({
      status: searchParams.status,
      clientId: searchParams.clientId,
      projectId: searchParams.projectId,
      page,
      limit: 20
    }),
    getClients({ limit: 1000 }), // Get all clients for filtering/creation
    getProjects({ limit: 1000 }) // Get all projects for filtering/creation
  ]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <InvoicesTable 
        data={invoicesResponse as any} 
        clients={(clientsResponse as any).clients || []} 
        projects={projectsResponse.projects} 
      />
    </div>
  );
}
