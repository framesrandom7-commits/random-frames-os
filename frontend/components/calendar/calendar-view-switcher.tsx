"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Prisma } from "@prisma/client";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { updateCalendarEvent } from "@/app/actions/calendar";
import EventForm from "./event-form";

// Views
import MonthView from "./views/month-view";
import WeekView from "./views/week-view";
import DayView from "./views/day-view";
import AgendaView from "./views/agenda-view";

type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface CalendarViewSwitcherProps {
  events: CalendarEventWithRelations[];
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
  currentView: string;
  currentDate: Date;
}

export default function CalendarViewSwitcher({ 
  events, 
  clients, 
  projects, 
  currentView, 
  currentDate 
}: CalendarViewSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithRelations | undefined>();
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [initialDateForForm, setInitialDateForForm] = useState<Date | undefined>();

  const updateURL = (newDate: Date, view?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString());
    if (view) {
      params.set("view", view);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePrev = () => {
    switch (currentView) {
      case "month": updateURL(subMonths(currentDate, 1)); break;
      case "week": updateURL(subWeeks(currentDate, 1)); break;
      case "day":
      case "agenda": updateURL(subDays(currentDate, 1)); break;
      default: updateURL(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case "month": updateURL(addMonths(currentDate, 1)); break;
      case "week": updateURL(addWeeks(currentDate, 1)); break;
      case "day":
      case "agenda": updateURL(addDays(currentDate, 1)); break;
      default: updateURL(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    updateURL(new Date());
  };

  const setView = (view: string) => {
    updateURL(currentDate, view);
  };

  const handleEventClick = (event: CalendarEventWithRelations) => {
    setSelectedEvent(event);
    setIsEventFormOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedEvent(undefined);
    setInitialDateForForm(date);
    setIsEventFormOpen(true);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const eventId = result.draggableId;
    const destDroppableId = result.destination.droppableId; 
    // Usually destDroppableId is the ISO date string of the day
    
    // Check if destination is a valid date
    const newDate = new Date(destDroppableId);
    if (isNaN(newDate.getTime())) return;
    
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Optimistic UI update could go here
    startTransition(async () => {
      await updateCalendarEvent(eventId, { date: newDate });
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-white/10 bg-black/40 gap-4">
        
        {/* Date Navigation */}
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white min-w-[140px]">
            {currentView === "month" && format(currentDate, "MMMM yyyy")}
            {currentView === "week" && `${format(subDays(currentDate, currentDate.getDay()), "MMM d")} - ${format(addDays(currentDate, 6 - currentDate.getDay()), "MMM d, yyyy")}`}
            {(currentView === "day" || currentView === "agenda") && format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
          <div className="flex items-center bg-white/5 rounded-md p-1 border border-white/10">
            <Button variant="ghost" size="icon" onClick={handlePrev} disabled={isPending} className="h-7 w-7 text-zinc-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday} disabled={isPending} className="h-7 px-3 text-xs text-zinc-400 hover:text-white">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNext} disabled={isPending} className="h-7 w-7 text-zinc-400 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-white/5 rounded-md p-1 border border-white/10">
          {["month", "week", "day", "agenda"].map(view => (
            <Button 
              key={view}
              variant="ghost" 
              size="sm" 
              onClick={() => setView(view)} 
              disabled={isPending}
              className={`h-7 px-3 text-xs capitalize ${currentView === view ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {view}
            </Button>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-hidden relative ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <DragDropContext onDragEnd={onDragEnd}>
          {currentView === "month" && (
            <MonthView 
              events={events} 
              currentDate={currentDate} 
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
          {currentView === "week" && (
            <WeekView 
              events={events} 
              currentDate={currentDate} 
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
          {currentView === "day" && (
            <DayView 
              events={events} 
              currentDate={currentDate} 
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          )}
          {currentView === "agenda" && (
            <AgendaView 
              events={events} 
              currentDate={currentDate} 
              onEventClick={handleEventClick}
            />
          )}
        </DragDropContext>
      </div>

      <EventForm 
        open={isEventFormOpen} 
        onOpenChange={setIsEventFormOpen} 
        event={selectedEvent}
        clients={clients} 
        projects={projects} 
        initialDate={initialDateForForm}
      />
    </>
  );
}
