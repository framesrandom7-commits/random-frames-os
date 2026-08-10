import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import ReportsDashboard from "@/components/reports/reports-dashboard";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await verifySession();
  
  if (session) {
    const userRecord = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true }
    });
    
    if (userRecord && userRecord.role?.name === "CO_FOUNDER") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Reports" />
      
      <ReportsDashboard />
    </div>
  );
}
