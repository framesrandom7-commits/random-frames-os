"use client";

import React from "react";
import { ModulePage, ModuleDataView } from "@/components/ui/module";
import { projectConfig } from "@/components/projects/project-config";
import { ViewType } from "@/components/ui/module/module-view-switcher";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import Link from "next/link";

export interface ProjectsModuleClientProps {
  data: any[];
  total: number;
  stats: any;
  allUsers: any[];
  allClients: any[];
  currentView: ViewType;
}

export function ProjectsModuleClient({
  data,
  total,
  stats,
  allUsers,
  allClients,
  currentView,
}: ProjectsModuleClientProps) {
  // Inject dynamic filters (Assigned User) and stats into a cloned config
  const pageConfig = {
    ...projectConfig,
    filters: [
      ...projectConfig.filters,
      {
        id: "assignedUserId",
        label: "Assigned To",
        type: "select" as const,
        options: allUsers.map(u => ({ label: u.name || u.email, value: u.id }))
      }
    ],
    summary: projectConfig.summary.map(s => {
      if (s.id === "activeProjects") return { ...s, value: stats.activeProjects.toString() };
      if (s.id === "upcomingShoots") return { ...s, value: stats.upcomingShoots.toString() };
      if (s.id === "overdueDeliveries") return { ...s, value: stats.overdueDeliveries.toString() };
      if (s.id === "revenueInProgress") return { ...s, value: `₹${stats.revenueInProgress.toLocaleString('en-IN')}` };
      return s;
    })
  };

  const primaryAction = (
    <Link href={pageConfig.metadata.routes.create}>
      <Button className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
        <FolderPlus className="mr-2 h-4 w-4" />
        New Project
      </Button>
    </Link>
  );

  return (
    <ModulePage
      title="Projects"
      subtitle="Manage ongoing productions and assignments"
      primaryAction={primaryAction}
      config={pageConfig as any}
      stats={stats}
      currentView={currentView}
    >
      <ModuleDataView
        data={data}
        columns={pageConfig.columns}
        cardRender={pageConfig.cardRender}
        getRowId={(row) => row.id}
        isEmpty={data.length === 0}
        pagination={{
          totalCount: total,
          defaultPageSize: 50
        }}
        bulkActions={pageConfig.bulkActions}
      />
    </ModulePage>
  );
}
