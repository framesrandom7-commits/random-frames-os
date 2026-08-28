import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InternalWorkspaceDashboard from "@/components/clients/internal-workspace-dashboard";
import { getProjects } from "@/app/actions/project";
import { getShoots } from "@/app/actions/shoot";
import { getClientStrategy } from "@/app/actions/strategy";
import { getCalendarEvents } from "@/app/actions/calendar";
import { getClientContentDeliverables } from "@/app/actions/content-pipeline";
import { getQuotations } from "@/app/actions/quotation";
import { getClientContentMetrics } from "@/app/actions/content-metrics";

export const dynamic = "force-dynamic";

export default async function ClientWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const clientId = resolvedParams.id;

  // Verify client exists and get core data
  const client = await prisma.client.findUnique({
    where: { id: clientId }
  });

  if (!client) {
    notFound();
  }

  // Fetch all necessary module data concurrently
  const [projectData, shootData, invoices, clientsForTable, strategy, eventsData, contentDeliverables, quotationsData, contentMetrics] = await Promise.all([
    getProjects({ clientId, limit: 100 }),
    getShoots({ clientId, limit: 100 }),
    prisma.invoice.findMany({ 
      where: { clientId }, 
      orderBy: { issueDate: 'desc' }, 
      include: { project: { select: { title: true } } } 
    }),
    prisma.client.findMany({ 
      select: { id: true, businessName: true }, 
      orderBy: { businessName: 'asc' }, 
      where: { archivedAt: null } 
    }),
    getClientStrategy(clientId),
    getCalendarEvents({ clientId, eventType: "CONTENT_PUBLISHING" }),
    getClientContentDeliverables(clientId),
    getQuotations({ clientId }),
    getClientContentMetrics(clientId)
  ]);
  
  const events = Array.isArray(eventsData) ? eventsData : [];

  return (
    <InternalWorkspaceDashboard
      clientId={client.id}
      clientName={client.businessName}
      contactPerson={client.contactPerson || ""}
      clientCode={client.clientCode}
      projects={projectData.projects as any[]}
      shoots={shootData.shoots as any[]}
      invoices={invoices as any[]}
      clientsForTable={clientsForTable as any[]}
      strategy={strategy}
      calendarEvents={events as any[]}
      contentDeliverables={contentDeliverables as any[]}
      quotations={quotationsData.quotations as any[]}
      contentMetrics={contentMetrics as any[]}
    />
  );
}
