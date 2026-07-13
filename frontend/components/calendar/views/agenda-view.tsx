"use client";

import React from "react";
import { Prisma, CalendarEventType } from "@prisma/client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Clock, MapPin, User, Calendar as CalendarIcon, Package, Flag } from "lucide-react";
import { format } from "date-fns";

type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface AgendaViewProps {
  events: CalendarEventWithRelations[];
  currentDate: Date;
  onEventClick: (event: CalendarEventWithRelations) => void;
}

export default function AgendaView({ events, currentDate, onEventClick }: AgendaViewProps) {
  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    
    // If same date, sort by time
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    
    const timeA = a.startTime || "00:00";
    const timeB = b.startTime || "00:00";
    return timeA.localeCompare(timeB);
  });

  // Group events by date string
  const groupedEvents = sortedEvents.reduce((acc, event) => {
    const dateStr = format(new Date(event.date), "EEEE, MMMM d, yyyy");
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEventWithRelations[]>);

  const getEventColor = (type: CalendarEventType) => {
    switch (type) {
      case "SHOOT": return "border-blue-500 text-blue-200 bg-blue-500/10";
      case "MEETING": return "border-purple-500 text-purple-200 bg-purple-500/10";
      case "FOLLOW_UP": return "border-amber-500 text-amber-200 bg-amber-500/10";
      case "DELIVERY": return "border-emerald-500 text-emerald-200 bg-emerald-500/10";
      case "PAYMENT_DUE": return "border-red-500 text-red-200 bg-red-500/10";
      default: return "border-zinc-500 text-zinc-200 bg-zinc-500/10";
    }
  };

  const getEventIcon = (type: CalendarEventType) => {
    switch (type) {
      case "SHOOT": return <CalendarIcon className="h-4 w-4" />;
      case "MEETING": return <Clock className="h-4 w-4" />;
      case "FOLLOW_UP": return <Flag className="h-4 w-4" />;
      case "DELIVERY": return <Package className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar bg-black/40">
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 italic">
          <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
          No events scheduled for the selected time period.
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
          {Object.entries(groupedEvents).map(([dateStr, dayEvents]) => (
            <div key={dateStr} className="space-y-4">
              <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md py-2 border-b border-white/10">
                <h2 className="text-lg font-medium text-white">{dateStr}</h2>
              </div>
              
              <div className="space-y-3 pl-4 border-l-2 border-white/5 ml-2">
                {dayEvents.map((event) => (
                  <div 
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`p-4 rounded-lg border-l-4 hover:bg-white/5 transition-colors cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center ${getEventColor(event.eventType)}`}
                  >
                    <div className="flex-shrink-0 w-24 font-medium text-sm">
                      {event.isAllDay ? "All Day" : event.startTime}
                    </div>
                    
                    <div className="flex-1 flex items-center gap-3">
                      <div className="p-2 rounded-full bg-black/30">
                        {getEventIcon(event.eventType)}
                      </div>
                      
                      <div>
                        <div className="font-semibold text-base mb-1">{event.title}</div>
                        <div className="flex flex-wrap items-center gap-4 text-xs opacity-80">
                          {event.client && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" /> {event.client.businessName}
                            </div>
                          )}
                          
                          {event.project && (
                            <div className="flex items-center gap-1 text-zinc-400">
                              <span className="font-medium">Project:</span> {event.project.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 text-xs px-2 py-1 rounded bg-black/30 uppercase tracking-wider font-medium opacity-80 self-start sm:self-center">
                      {event.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
