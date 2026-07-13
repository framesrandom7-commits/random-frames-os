"use client";

import React from "react";
import { Prisma, CalendarEventType } from "@prisma/client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Clock, MapPin, User } from "lucide-react";

type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface DayViewProps {
  events: CalendarEventWithRelations[];
  currentDate: Date;
  onEventClick: (event: CalendarEventWithRelations) => void;
  onDayClick: (date: Date) => void;
}

export default function DayView({ events, currentDate, onEventClick, onDayClick }: DayViewProps) {
  const dateStr = currentDate.toISOString();
  
  const dayEvents = events.filter(e => {
    const eDate = new Date(e.date);
    return eDate.getFullYear() === currentDate.getFullYear() && 
           eDate.getMonth() === currentDate.getMonth() && 
           eDate.getDate() === currentDate.getDate();
  });
  
  const allDayEvents = dayEvents.filter(e => e.isAllDay);
  const timeEvents = dayEvents.filter(e => !e.isAllDay);

  const getEventColor = (type: CalendarEventType) => {
    switch (type) {
      case "SHOOT": return "border-blue-500 text-blue-200 bg-blue-500/20";
      case "MEETING": return "border-purple-500 text-purple-200 bg-purple-500/20";
      case "FOLLOW_UP": return "border-amber-500 text-amber-200 bg-amber-500/20";
      case "DELIVERY": return "border-emerald-500 text-emerald-200 bg-emerald-500/20";
      case "PAYMENT_DUE": return "border-red-500 text-red-200 bg-red-500/20";
      default: return "border-zinc-500 text-zinc-200 bg-zinc-500/20";
    }
  };

  return (
    <div className="h-full flex flex-col bg-black/40">
      <Droppable droppableId={dateStr}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto p-4 custom-scrollbar ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
            onClick={() => onDayClick(currentDate)}
          >
            {allDayEvents.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 border-b border-white/10 pb-2">All Day</h3>
                {allDayEvents.map((event, index) => (
                  <Draggable key={event.id} draggableId={event.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={`p-3 rounded-lg border-l-4 hover:opacity-80 transition-opacity flex items-center justify-between ${getEventColor(event.eventType)} ${snapshot.isDragging ? 'shadow-lg shadow-black/50 ring-1 ring-white/20' : ''}`}
                      >
                        <div>
                          <div className="font-semibold text-sm">{event.title}</div>
                          {event.client && (
                            <div className="opacity-80 text-xs mt-1 flex items-center gap-1">
                              <User className="h-3 w-3" /> {event.client.businessName}
                            </div>
                          )}
                        </div>
                        <div className="text-xs uppercase tracking-wider opacity-70 font-medium">
                          {event.eventType.replace("_", " ")}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-400 mb-3 border-b border-white/10 pb-2">Scheduled</h3>
              {timeEvents.length === 0 ? (
                <div className="text-center text-zinc-500 py-10 italic">No scheduled events for this day. Click to add one.</div>
              ) : (
                <div className="space-y-3">
                  {timeEvents.map((event, index) => (
                    <Draggable key={event.id} draggableId={event.id} index={index + allDayEvents.length}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                          className={`p-4 rounded-lg border-l-4 hover:opacity-80 transition-opacity flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${getEventColor(event.eventType)} ${snapshot.isDragging ? 'shadow-lg shadow-black/50 ring-1 ring-white/20' : ''}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-base">{event.title}</span>
                              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-black/20 font-medium opacity-80">
                                {event.eventType.replace("_", " ")}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-xs opacity-80 mt-2">
                              <div className="flex items-center gap-1 font-medium bg-black/20 px-2 py-1 rounded">
                                <Clock className="h-3 w-3" /> 
                                {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                              </div>
                              
                              {event.client && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> {event.client.businessName}
                                </div>
                              )}
                              
                              {event.shoot?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {event.shoot.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
