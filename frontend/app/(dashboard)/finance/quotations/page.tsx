import React from "react";
import { getQuotations } from "@/app/actions/quotation";
import { getClients } from "@/app/actions/client";
import QuotationsTable from "@/components/finance/quotations-table";
import { QuotationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: {
    status?: QuotationStatus;
    clientId?: string;
    projectId?: string;
    page?: string;
  };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  
  const [quotationsResponse, clientsResponse] = await Promise.all([
    getQuotations({
      status: searchParams.status,
      clientId: searchParams.clientId,
      projectId: searchParams.projectId,
      page,
      limit: 20
    }),
    getClients({ limit: 1000 }), // Get all clients for filtering/creation
  ]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <QuotationsTable 
        data={quotationsResponse} 
        clients={clientsResponse.clients} 
      />
    </div>
  );
}
