import React from "react";
import { getInvoice } from "@/app/actions/invoice";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import { getSettings } from "@/app/actions/settings";
import InvoiceGenerator from "@/components/finance/invoice-generator";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [invoice, clientsResponse, projectsResponse, settings] = await Promise.all([
    getInvoice(resolvedParams.id),
    getClients({ limit: 1000 }),
    getProjects({ limit: 1000 }),
    getSettings(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <InvoiceGenerator 
        invoice={invoice as any} 
        clients={(clientsResponse as any).clients || []} 
        projects={projectsResponse.projects} 
        settings={settings}
      />
    </div>
  );
}
