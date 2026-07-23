import React from "react";
import { getInvoice } from "@/app/actions/invoice";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import InvoiceGenerator from "@/components/finance/invoice-generator";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [invoice, clientsResponse, projectsResponse] = await Promise.all([
    getInvoice(resolvedParams.id),
    getClients({ limit: 1000 }),
    getProjects({ limit: 1000 }),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <InvoiceGenerator 
        invoice={invoice} 
        clients={clientsResponse.clients} 
        projects={projectsResponse.projects} 
      />
    </div>
  );
}
