import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import ProjectForm from "@/components/projects/project-form";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "New Project - Random Frames",
  description: "Create a new project",
};

export default async function NewProjectPage() {
  const [clients, users] = await Promise.all([
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' }, where: { archivedAt: null } })
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <PageHeader 
        title="Create New Project" />
      
      <ProjectForm 
        clients={clients} 
        users={users}
      />
    </div>
  );
}
