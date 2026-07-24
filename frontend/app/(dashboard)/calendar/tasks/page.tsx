import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskService } from "@/lib/scheduling/task.service";
import { TaskList } from "@/components/calendar/tasks/task-list";
import { getProjects } from "@/app/actions/project";
import { getClients } from "@/app/actions/client";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: {
    projectId?: string;
    clientId?: string;
    status?: string;
    priority?: string;
  };
}) {
  const [tasks, projectsRes, clientsRes] = await Promise.all([
    TaskService.getTasks({
      projectId: searchParams.projectId,
      clientId: searchParams.clientId,
      status: searchParams.status ? [searchParams.status as any] : undefined,
      priority: searchParams.priority ? [searchParams.priority as any] : undefined,
    }),
    getProjects({ limit: 100 }),
    getClients({ limit: 100 }),
  ]);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6">
      <PageHeader 
        title="Tasks & Checklists"
        subtitle="Manage your to-dos, subtasks, and dependencies"
      />
      
      <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10 rounded-xl backdrop-blur-md p-6">
        {/* Pass down data to the client component */}
        <TaskList 
          initialTasks={tasks} 
          projects={projectsRes.projects}
          clients={(clientsRes as any).clients || []}
        />
      </div>
    </div>
  );
}
