import React from "react";
import { prisma } from "@/lib/prisma";
import ShootFormClientWrapper from "./shoot-form-client-wrapper";

export default async function NewShootPage() {
  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ 
      select: { id: true, businessName: true }, 
      orderBy: { businessName: 'asc' }, 
      where: { archivedAt: null } 
    }),
    prisma.project.findMany({ 
      select: { id: true, title: true, clientId: true }, 
      orderBy: { title: 'asc' }, 
      where: { archivedAt: null } 
    })
  ]);

  return (
    <div className="flex-1 w-full h-full bg-transparent">
      <ShootFormClientWrapper clients={clients} projects={projects} />
    </div>
  );
}
