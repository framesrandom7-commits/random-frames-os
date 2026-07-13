"use client";

import React from "react";
import { Prisma, CalendarEventType } from "@prisma/client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Clock } from "lucide-react";

type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface WeekViewProps {
  events: CalendarEventWithRelations[];
  currentDate: Date;
  onEventClick: (event: CalendarEventWithRelations) => void;
  onDayClick: (date: Date) => void;
}

export default function WeekView({ events, currentDate, onEventClick, onDayClick }: WeekViewProps) {
  // Get start of the week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
  
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString(); // Droppable ID
    
    const dayEvents = events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getFullYear() === date.getFullYear() && 
             eDate.getMonth() === date.getMonth() && 
             eDate.getDate() === date.getDate();
    });
    
    const isToday = new Date().toDateString() === date.toDateString();
    
    days.push(
      <Droppable key={dateStr} droppableId={dateStr}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            onClick={() => onDayClick(date)}
            className={`min-h-[300px] bg-black/40 border-r border-b ${isToday ? 'border-[#C1121F]/50 bg-[#C1121F]/5' : 'border-white/10'} p-2 flex flex-col hover:bg-white/5 transition-colors cursor-pointer ${snapshot.isDraggingOver ? 'bg-white/10' : ''}`}
          >
            <div className="flex flex-col items-center justify-center mb-4 pb-2 border-b border-white/5">
              <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}
              </span>
              <span className={`text-lg font-medium ${isToday ? 'text-[#C1121F] bg-[#C1121F]/10 w-9 h-9 flex items-center justify-center rounded-full' : 'text-zinc-300'}`}>
                {date.getDate()}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {dayEvents.map((event, index) => (
                <Draggable key={event.id} draggableId={event.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`text-xs p-2 rounded border-l-2 hover:opacity-80 transition-opacity ${getEventColor(event.eventType)} ${snapshot.isDragging ? 'shadow-lg shadow-black/50 opacity-100 z-50 ring-1 ring-white/20' : ''}`}
                      title={event.title}
                    >
                      <div className="font-semibold">{event.title}</div>
                      {!event.isAllDay && event.startTime && (
                        <div className="opacity-80 text-[10px] mt-1 flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" /> {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                        </div>
                      )}
                      {event.client && (
                        <div className="opacity-70 text-[10px] mt-1 truncate">
                          {event.client.businessName}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>
    );
  }

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
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-7 border-l border-t border-white/10 min-h-full">
          {days}
        </div>
      </div>
    </div>
  );
}
