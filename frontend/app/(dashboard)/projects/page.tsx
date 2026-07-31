import React from "react";
import { getProjects, getProjectStats } from "@/app/actions/project";
import { prisma } from "@/lib/prisma";
import { ProjectsModuleClient } from "@/components/projects/projects-module-client";
import { projectConfig } from "@/components/projects/project-config";
import { ViewType } from "@/components/ui/module/module-view-switcher";
import { ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status as ProjectStatus : "";
  const priority = typeof searchParams.priority === "string" ? searchParams.priority as ProjectPriority : "";
  const paymentStatus = typeof searchParams.paymentStatus === "string" ? searchParams.paymentStatus as PaymentStatus : "";
  const archived = searchParams.archived === "true";
  const sortBy = typeof searchParams.sortBy === "string" ? searchParams.sortBy : projectConfig.defaultSort.by;
  const sortOrder = searchParams.sortOrder === "asc" ? "asc" : projectConfig.defaultSort.order;
  const view = typeof searchParams.view === "string" ? searchParams.view as ViewType : projectConfig.defaultView;
  
  // Specific filter for assigned user mapping to client-side filter
  const assignedUserId = typeof searchParams.assignedUserId === "string" ? searchParams.assignedUserId : "";

  // Fetch projects and stats concurrently
  const [projectData, stats, allUsers, allClients] = await Promise.all([
    getProjects({ 
      page, 
      limit: 50, 
      search, 
      status, 
      priority, 
      paymentStatus, 
      archived, 
      sortBy, 
      sortOrder,
      assignedUserId
    }),
    getProjectStats(),
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' }, where: { archivedAt: null } }),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } })
  ]);

  return (
    <ProjectsModuleClient 
      data={projectData.projects as any[]}
      total={projectData.total}
      stats={stats}
      allUsers={allUsers}
      allClients={allClients}
      currentView={view as any}
    />
  );
}
