"use client";

import React, { useRef, useState, useTransition } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Prisma } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import EventForm from "./event-form";
import { updateCalendarEvent } from "@/app/actions/calendar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2 } from "lucide-react";

type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface FullCalendarWrapperProps {
  events: CalendarEventWithRelations[];
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
  currentDate: Date;
}

export default function FullCalendarWrapper({
  events,
  clients,
  projects,
  currentDate
}: FullCalendarWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const calendarRef = useRef<FullCalendar>(null);
  
  const [isPending, startTransition] = useTransition();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithRelations | undefined>();
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [initialDateForForm, setInitialDateForForm] = useState<Date | undefined>();

  // Map our DB events to FullCalendar event format
  const fcEvents = events.map((event) => {
    // Basic date parsing
    const startDate = new Date(event.date);
    if (event.startTime && !event.isAllDay) {
      const [h, m] = event.startTime.split(':');
      startDate.setHours(parseInt(h), parseInt(m), 0, 0);
    }
    
    let endDate = undefined;
    if (event.endTime && !event.isAllDay) {
      endDate = new Date(event.date);
      const [h, m] = event.endTime.split(':');
      endDate.setHours(parseInt(h), parseInt(m), 0, 0);
    }

    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      allDay: event.isAllDay,
      backgroundColor: event.color || '#3b82f6',
      borderColor: event.color || '#3b82f6',
      extendedProps: {
        originalEvent: event,
      }
    };
  });

  const handleEventClick = (info: any) => {
    const originalEvent = info.event.extendedProps.originalEvent;
    setSelectedEvent(originalEvent);
    setIsEventFormOpen(true);
  };

  const handleDateSelect = (info: any) => {
    setSelectedEvent(undefined);
    setInitialDateForForm(info.start);
    setIsEventFormOpen(true);
  };

  const handleEventDrop = async (info: any) => {
    const eventId = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end;
    const isAllDay = info.event.allDay;

    startTransition(async () => {
      try {
        const updateData: any = {
          date: newStart.toISOString(),
          isAllDay
        };

        if (!isAllDay && newStart) {
          updateData.startTime = `${newStart.getHours().toString().padStart(2, '0')}:${newStart.getMinutes().toString().padStart(2, '0')}`;
        }
        
        if (!isAllDay && newEnd) {
          updateData.endTime = `${newEnd.getHours().toString().padStart(2, '0')}:${newEnd.getMinutes().toString().padStart(2, '0')}`;
        }

        const res = await updateCalendarEvent(eventId, updateData);
        if (res.error) {
          toast.error(res.error);
          info.revert(); // Revert UI if server fails
        } else {
          toast.success("Event updated");
          router.refresh();
        }
      } catch (e) {
        toast.error("Failed to update event");
        info.revert();
      }
    });
  };

  const handleEventResize = async (info: any) => {
    const eventId = info.event.id;
    const newEnd = info.event.end;

    if (!newEnd) return;

    startTransition(async () => {
      try {
        const updateData: any = {
          endTime: `${newEnd.getHours().toString().padStart(2, '0')}:${newEnd.getMinutes().toString().padStart(2, '0')}`
        };

        const res = await updateCalendarEvent(eventId, updateData);
        if (res.error) {
          toast.error(res.error);
          info.revert();
        } else {
          toast.success("Event updated");
          router.refresh();
        }
      } catch (e) {
        toast.error("Failed to update event");
        info.revert();
      }
    });
  };

  const updateDateParams = (newDate: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const changeView = (view: string) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 p-4 rounded-xl backdrop-blur-md overflow-hidden relative text-white">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => calendarRef.current?.getApi().prev()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            calendarRef.current?.getApi().today();
            updateDateParams(new Date());
          }}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => calendarRef.current?.getApi().next()}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium ml-2">
             {/* Title can be read from FullCalendar API, but we'll let it manage its own toolbar title or build it custom */}
          </span>
          {isPending && <Loader2 className="w-4 h-4 animate-spin ml-2 text-white/50" />}
        </div>
        <div className="flex bg-white/5 p-1 rounded-lg">
          <Button variant="ghost" size="sm" onClick={() => changeView('dayGridMonth')}>Month</Button>
          <Button variant="ghost" size="sm" onClick={() => changeView('timeGridWeek')}>Week</Button>
          <Button variant="ghost" size="sm" onClick={() => changeView('timeGridDay')}>Day</Button>
          <Button variant="ghost" size="sm" onClick={() => changeView('listWeek')}>Agenda</Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden fc-dark-theme">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          initialDate={currentDate}
          headerToolbar={{
            left: 'title',
            center: '',
            right: ''
          }}
          events={fcEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          eventClick={handleEventClick}
          select={handleDateSelect}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={(arg) => {
            // Update URL when calendar changes dates
            const currentParamDate = searchParams.get('date');
            if (!currentParamDate || new Date(currentParamDate).getMonth() !== arg.start.getMonth()) {
               // Throttle this or handle it carefully to avoid loops
            }
          }}
          height="100%"
        />
      </div>

      <EventForm 
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        event={selectedEvent}
        initialDate={initialDateForForm}
        clients={clients}
        projects={projects}
      />

      <style jsx global>{`
        /* FullCalendar Custom Dark Theme overrides */
        .fc-dark-theme .fc-theme-standard td, .fc-dark-theme .fc-theme-standard th {
          border-color: rgba(255, 255, 255, 0.1);
        }
        .fc-dark-theme .fc-col-header-cell {
          background-color: rgba(255, 255, 255, 0.02);
          padding: 8px 0;
        }
        .fc-dark-theme .fc-day-today {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }
        .fc-dark-theme .fc-list-day-cushion {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .fc-dark-theme .fc-list-event:hover td {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .fc-dark-theme .fc-toolbar-title {
          font-size: 1.25rem !important;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
