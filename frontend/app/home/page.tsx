import React from "react";
import LandingPage from "@/components/auth/landing-page";
import WorkspacePage from "@/components/workspace/workspace-page";

import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await verifySession();

  if (!session) {
    return <LandingPage />;
  }

  const userRecord = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true }
  });

  if (!userRecord) {
    return <LandingPage />; // Or handle error
  }

  const user = { 
    name: userRecord.name || "User",
    roleName: userRecord.role?.name || "Viewer"
  };

  // Fetch Dashboard Metrics
  const activeProjectsCount = await prisma.project.count({
    where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }
  });

  const openLeadsCount = await prisma.lead.count({
    where: { status: { notIn: [LeadStatus.CONVERTED, LeadStatus.LOST] } }
  });

  const pendingInvoices = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: { in: ["SENT", "PARTIAL", "OVERDUE"] } }
  });
  const pendingInvoicesAmount = Number(pendingInvoices._sum.total || 0);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const shootsTodayCount = await prisma.shoot.count({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  });

  const metrics = {
    activeProjectsCount,
    openLeadsCount,
    pendingInvoicesAmount,
    shootsTodayCount
  };

  return <WorkspacePage user={user} metrics={metrics} />;
}

