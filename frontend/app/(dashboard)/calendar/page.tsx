import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { getCalendarEvents } from "@/app/actions/calendar";
import { getClients } from "@/app/actions/client";
import { getProjects } from "@/app/actions/project";
import CalendarSidebar from "@/components/calendar/calendar-sidebar";
import CalendarViewSwitcher from "@/components/calendar/calendar-view-switcher";
import { CalendarEventType, CalendarEventStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: {
    view?: string;
    date?: string;
    clientId?: string;
    projectId?: string;
    eventType?: CalendarEventType;
    status?: CalendarEventStatus;
  };
}) {
  const currentView = searchParams.view || "month";
  const currentDate = searchParams.date || new Date().toISOString();

  // Determine date range based on view
  const d = new Date(currentDate);
  let dateStart = new Date(d.getFullYear(), d.getMonth(), 1);
  let dateEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

  if (currentView === "week") {
    dateStart = new Date(d);
    dateStart.setDate(d.getDate() - d.getDay());
    dateStart.setHours(0, 0, 0, 0);
    dateEnd = new Date(dateStart);
    dateEnd.setDate(dateStart.getDate() + 6);
    dateEnd.setHours(23, 59, 59, 999);
  } else if (currentView === "day" || currentView === "agenda") {
    dateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    dateEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
  }

  const [events, clientsResponse, projectsResponse] = await Promise.all([
    getCalendarEvents({
      dateStart: dateStart.toISOString(),
      dateEnd: dateEnd.toISOString(),
      clientId: searchParams.clientId,
      projectId: searchParams.projectId,
      eventType: searchParams.eventType,
      status: searchParams.status,
    }),
    getClients({ limit: 1000 }),
    getProjects({ limit: 1000 }),
  ]);

  const clients = clientsResponse.clients.map(c => ({ id: c.id, businessName: c.businessName }));
  const projects = projectsResponse.projects.map(p => ({ id: p.id, title: p.title, clientId: p.clientId }));

  // Get Today's events and Overdue items for the Sidebar
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);
  
  const allRecentEvents = await getCalendarEvents({
    dateStart: new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1).toISOString(),
    dateEnd: new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0).toISOString(),
  });

  const todaysEvents = allRecentEvents.filter(e => {
    const eDate = new Date(e.date);
    return eDate >= todayStart && eDate <= todayEnd;
  });

  const overdueEvents = allRecentEvents.filter(e => {
    const eDate = new Date(e.date);
    return eDate < todayStart && e.status !== "COMPLETED" && e.status !== "CANCELLED";
  });

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6">
      <PageHeader 
        title="Calendar"
        subtitle="Your upcoming schedule"
      />
      
      <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
        <div className="w-full md:w-64 flex-shrink-0 overflow-y-auto custom-scrollbar pb-4 pr-1">
          <CalendarSidebar 
            todaysEvents={todaysEvents} 
            overdueEvents={overdueEvents}
            clients={clients}
            projects={projects}
          />
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
          <CalendarViewSwitcher 
            events={events} 
            clients={clients} 
            projects={projects} 
            currentView={currentView}
            currentDate={d}
          />
        </div>
      </div>
    </div>
  );
}
