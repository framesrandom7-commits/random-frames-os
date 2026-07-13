"use client";

import React from "react";
import { Prisma, CalendarEventType } from "@prisma/client";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Clock } from "lucide-react";

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

type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface MonthViewProps {
  events: CalendarEventWithRelations[];
  currentDate: Date;
  onEventClick: (event: CalendarEventWithRelations) => void;
  onDayClick: (date: Date) => void;
}

export default function MonthView({ events, currentDate, onEventClick, onDayClick }: MonthViewProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const days = [];
  
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-white/5 border border-white/5 opacity-50"></div>);
  }
  
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
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
            className={`min-h-[120px] bg-black/40 border-r border-b ${isToday ? 'border-[#C1121F]/50 ring-1 ring-inset ring-[#C1121F]' : 'border-white/10'} p-2 flex flex-col hover:bg-white/5 transition-colors cursor-pointer ${snapshot.isDraggingOver ? 'bg-white/10' : ''}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${isToday ? 'text-[#C1121F] bg-[#C1121F]/10 w-7 h-7 flex items-center justify-center rounded-full' : 'text-zinc-400'}`}>
                {i}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {dayEvents.map((event, index) => (
                <Draggable key={event.id} draggableId={event.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`text-xs p-1.5 rounded truncate border-l-2 hover:opacity-80 transition-opacity ${getEventColor(event.eventType)} ${snapshot.isDragging ? 'shadow-lg shadow-black/50 opacity-100 z-50' : ''}`}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {!event.isAllDay && event.startTime && (
                        <div className="opacity-80 truncate text-[10px] mt-0.5 flex items-center gap-1">
                          <Clock className="h-2 w-2" /> {event.startTime}
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

  // Calculate remaining empty cells to complete the grid (usually 35 or 42 cells total)
  const totalCells = days.length;
  const remainingCells = totalCells > 35 ? 42 - totalCells : 35 - totalCells;
  for (let i = 0; i < remainingCells; i++) {
    days.push(<div key={`empty-end-${i}`} className="min-h-[120px] bg-white/5 border-r border-b border-white/5 opacity-50"></div>);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-white/10 bg-black/60">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-zinc-500 py-2 border-r border-white/10 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-7 border-l border-white/10 min-h-full">
          {days}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
