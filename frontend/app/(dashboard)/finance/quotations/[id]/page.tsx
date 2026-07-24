import React from "react";
import { getQuotationById } from "@/app/actions/quotation";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import QuotationGenerator from "@/components/finance/quotation-generator";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function QuotationDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [quotation, clientsResponse, projectsResponse] = await Promise.all([
    getQuotationById(resolvedParams.id),
    getClients({ limit: 1000 }),
    getProjects({ limit: 1000 }),
  ]);

  if (!quotation) {
    notFound();
  }

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <QuotationGenerator 
        quotation={quotation} 
        clients={clientsResponse.clients} 
        projects={projectsResponse.projects} 
      />
    </div>
  );
}
