import React from "react";
import { getPaymentById } from "@/app/actions/payment";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import ReceiptGenerator from "@/components/finance/receipt-generator";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PaymentDetailsPage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [payment, clientsResponse, projectsResponse] = await Promise.all([
    getPaymentById(resolvedParams.id),
    getClients({ limit: 1000 }),
    getProjects({ limit: 1000 }),
  ]);

  if (!payment) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ReceiptGenerator 
        payment={payment as any} 
        clients={(clientsResponse as any).clients || []} 
        projects={projectsResponse.projects} 
      />
    </div>
  );
}
