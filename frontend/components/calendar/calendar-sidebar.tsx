"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar, Clock, AlertCircle, CalendarDays, Flag, Package } from "lucide-react";
import { CalendarEventType, CalendarEventStatus, Prisma } from "@prisma/client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import EventForm from "./event-form";

// Define the type we expect for events
type CalendarEventWithRelations = Prisma.CalendarEventGetPayload<{
  include: { client: true; project: true; shoot: true; lead: true }
}>;

interface CalendarSidebarProps {
  todaysEvents: CalendarEventWithRelations[];
  overdueEvents: CalendarEventWithRelations[];
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function CalendarSidebar({ todaysEvents, overdueEvents, clients, projects }: CalendarSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  
  const currentEventType = searchParams.get("eventType");
  const currentStatus = searchParams.get("status");

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const EventIcon = ({ type }: { type: CalendarEventType }) => {
    switch (type) {
      case "SHOOT": return <Calendar className="h-3 w-3" />;
      case "MEETING": return <Clock className="h-3 w-3" />;
      case "FOLLOW_UP": return <Flag className="h-3 w-3" />;
      case "DELIVERY": return <Package className="h-3 w-3" />;
      default: return <CalendarDays className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: CalendarEventType) => {
    switch (type) {
      case "SHOOT": return "border-blue-500/50 bg-blue-500/10 text-blue-400";
      case "MEETING": return "border-purple-500/50 bg-purple-500/10 text-purple-400";
      case "FOLLOW_UP": return "border-amber-500/50 bg-amber-500/10 text-amber-400";
      case "DELIVERY": return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
      case "PAYMENT_DUE": return "border-red-500/50 bg-red-500/10 text-red-400";
      default: return "border-zinc-500/50 bg-zinc-500/10 text-zinc-400";
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        className="w-full bg-[#C1121F] hover:bg-[#a00f1a] text-white flex items-center gap-2"
        onClick={() => setIsEventFormOpen(true)}
      >
        <Plus className="h-4 w-4" />
        New Event
      </Button>

      {/* Mini Dashboard */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#C1121F]" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {todaysEvents.length === 0 ? (
            <div className="text-xs text-zinc-500 italic py-2 text-center border border-dashed border-white/10 rounded-md">
              No events scheduled for today
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {todaysEvents.map(event => (
                <div key={event.id} className={`p-2 rounded-md border-l-2 text-xs ${getEventColor(event.eventType)}`}>
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-[10px] opacity-80 flex items-center gap-1 mt-1">
                    <Clock className="h-2.5 w-2.5" />
                    {event.isAllDay ? "All Day" : `${event.startTime || "?"} - ${event.endTime || "?"}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {overdueEvents.length > 0 && (
        <Card className="bg-red-950/20 border-red-900/50 backdrop-blur-md">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue Items ({overdueEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
              {overdueEvents.slice(0, 5).map(event => (
                <div key={event.id} className="p-2 rounded-md bg-red-900/20 border border-red-900/30 text-xs text-red-200">
                  <div className="font-semibold truncate">{event.title}</div>
                  <div className="text-[10px] opacity-80 mt-1">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {overdueEvents.length > 5 && (
                <div className="text-[10px] text-center text-red-400/70 pt-1">
                  +{overdueEvents.length - 5} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-400" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          
          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-400">Event Type</div>
            <div className="flex flex-wrap gap-1.5">
              <Badge 
                variant="outline" 
                className={`cursor-pointer ${!currentEventType ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
                onClick={() => setFilter("eventType", null)}
              >
                All
              </Badge>
              {["SHOOT", "MEETING", "FOLLOW_UP", "DELIVERY", "PAYMENT_DUE", "PERSONAL_REMINDER"].map(type => (
                <Badge 
                  key={type}
                  variant="outline" 
                  className={`cursor-pointer ${currentEventType === type ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
                  onClick={() => setFilter("eventType", type)}
                >
                  <EventIcon type={type as CalendarEventType} />
                  <span className="ml-1">{type.replace("_", " ")}</span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-400">Status</div>
            <div className="flex flex-wrap gap-1.5">
              <Badge 
                variant="outline" 
                className={`cursor-pointer ${!currentStatus ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
                onClick={() => setFilter("status", null)}
              >
                All
              </Badge>
              {["SCHEDULED", "COMPLETED", "CANCELLED"].map(status => (
                <Badge 
                  key={status}
                  variant="outline" 
                  className={`cursor-pointer ${currentStatus === status ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-zinc-400 border-white/10'}`}
                  onClick={() => setFilter("status", status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
          
        </CardContent>
      </Card>

      <EventForm 
        open={isEventFormOpen} 
        onOpenChange={setIsEventFormOpen} 
        clients={clients} 
        projects={projects} 
      />
    </div>
  );
}
