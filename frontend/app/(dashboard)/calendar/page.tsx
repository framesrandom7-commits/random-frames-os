import React, { Suspense } from "react";
import Topbar from "@/components/dashboard/topbar";
import ShootCalendarView from "@/components/shoots/shoot-calendar-view";
import { getShoots } from "@/app/actions/shoot";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const dateStart = typeof searchParams.dateStart === "string" ? new Date(searchParams.dateStart) : undefined;
  const dateEnd = typeof searchParams.dateEnd === "string" ? new Date(searchParams.dateEnd) : undefined;

  const [shootData, allClients, allProjects] = await Promise.all([
    getShoots({ limit: 1000, dateStart, dateEnd }), // Fetch enough for a whole month
    prisma.client.findMany({ select: { id: true, businessName: true }, orderBy: { businessName: 'asc' }, where: { archivedAt: null } }),
    prisma.project.findMany({ select: { id: true, title: true, clientId: true }, orderBy: { title: 'asc' }, where: { archivedAt: null } })
  ]);

  return (
    <>
      <Topbar title="Calendar" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <Suspense fallback={<div className="h-96 flex items-center justify-center text-zinc-500">Loading calendar...</div>}>
          <ShootCalendarView 
            shoots={shootData.shoots as any} 
            clients={allClients}
            projects={allProjects}
          />
        </Suspense>
      </main>
    </>
  );
}
