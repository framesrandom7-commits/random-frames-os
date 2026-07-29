import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import ProjectForm from "@/components/projects/project-form";
import { prisma } from "@/lib/prisma";
import { getProject } from "@/app/actions/project";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Project - Random Frames",
  description: "Edit project details",
};

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [project, clients, users] = await Promise.all([
    getProject(resolvedParams.id),
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' }, where: { archivedAt: null } })
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <PageHeader 
        title="Edit Project"
        subtitle={`Update details for ${project.title}`}
      />
      
      <ProjectForm 
        project={project as any}
        clients={clients} 
        users={users}
      />
    </div>
  );
}
