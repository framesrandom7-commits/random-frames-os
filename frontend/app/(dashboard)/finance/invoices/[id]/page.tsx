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

  if (!invoice || ('error' in (invoice as any))) {
    // If it's a Prisma error, it might be due to outdated client
    if ((invoice as any)?.error) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
          <div className="text-[#E53935] text-xl font-bold mb-4">Database Connection Error</div>
          <p className="text-zinc-400 mb-2">There was an issue retrieving this invoice from the database.</p>
          <p className="text-zinc-500 text-sm bg-black/20 p-4 rounded-lg">
            {(invoice as any).error}
          </p>
          <p className="text-zinc-300 mt-6 text-sm font-medium">
            Developer Note: Please restart your Next.js server (Ctrl+C then npm run dev) to refresh the Prisma Client.
          </p>
        </div>
      );
    }
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
