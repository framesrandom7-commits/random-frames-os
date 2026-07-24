import React from "react";
import { getPayments } from "@/app/actions/payment";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import PaymentsTable from "@/components/finance/payments-table";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function PaymentsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const clientId = typeof resolvedParams.clientId === "string" ? resolvedParams.clientId : undefined;
  
  const [paymentsResponse, clientsResponse, projectsResponse] = await Promise.all([
    getPayments({ page, clientId }),
    getClients({ limit: 1000 }),
    getProjects({ limit: 1000 }),
  ]);

  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader 
        title="Payments Ledger"
        subtitle="Track all incoming payments"
      />
      <div className="flex-1 overflow-hidden">
        <PaymentsTable 
          data={paymentsResponse} 
          clients={clientsResponse.clients} 
          projects={projectsResponse.projects} 
        />
      </div>
    </div>
  );
}
