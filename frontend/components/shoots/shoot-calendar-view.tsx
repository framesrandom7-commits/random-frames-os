"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Camera, Plus, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Shoot, Client, Project } from "@prisma/client";
import ShootForm from "./shoot-form";
import { Badge } from "@/components/ui/badge";

interface ShootWithRelations extends Shoot {
  client: Client;
  project: Project;
}

interface ShootCalendarViewProps {
  shoots: ShootWithRelations[];
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function ShootCalendarView({ shoots, clients, projects }: ShootCalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [editingShoot, setEditingShoot] = useState<Shoot | undefined>(undefined);
  
  // State for current month being viewed
  const initialDateStr = searchParams.get("dateStart");
  const initialDate = initialDateStr ? new Date(initialDateStr) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const handleShootClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push(`/shoots/${id}`);
  };

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newMonth);
    updateURL(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newMonth);
    updateURL(newMonth);
  };
  
  const handleToday = () => {
    const today = new Date();
    const newMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(newMonth);
    updateURL(newMonth);
  };

  const updateURL = (monthStart: Date) => {
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("dateStart", monthStart.toISOString());
    params.set("dateEnd", monthEnd.toISOString());
    params.set("page", "1");
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Calendar logic
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  
  // Empty cells for days before the 1st
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[120px] bg-white/5 border border-white/5 rounded-md opacity-50"></div>);
  }
  
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayShoots = shoots.filter(s => {
      if (!s.date) return false;
      const sDate = new Date(s.date);
      return sDate.getFullYear() === date.getFullYear() && 
             sDate.getMonth() === date.getMonth() && 
             sDate.getDate() === date.getDate();
    });
    
    const isToday = new Date().toDateString() === date.toDateString();
    
    days.push(
      <div 
        key={`day-${i}`} 
        className={`min-h-[120px] bg-black/40 border ${isToday ? 'border-[#C1121F]/50 ring-1 ring-[#C1121F]' : 'border-white/10'} rounded-md p-2 flex flex-col hover:border-white/20 transition-colors`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${isToday ? 'text-[#C1121F] bg-[#C1121F]/10 w-7 h-7 flex items-center justify-center rounded-full' : 'text-zinc-400'}`}>
            {i}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-white/10" onClick={() => {
             // Create shoot on this specific day
             // Normally we'd prefill this date, but ShootForm doesn't currently accept a date prefill prop.
             // We can just open the form for now.
             setEditingShoot(undefined);
             setOpen(true);
          }}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {dayShoots.map(shoot => (
            <div 
              key={shoot.id}
              onClick={(e) => handleShootClick(e, shoot.id)}
              className={`text-xs p-1.5 rounded cursor-pointer truncate border-l-2 hover:opacity-80 transition-opacity ${getStatusStyles(shoot.status)}`}
              title={`${shoot.title} - ${shoot.client.businessName}`}
            >
              <div className="font-medium truncate">{shoot.title}</div>
              <div className="opacity-80 truncate text-[10px] mt-0.5">{shoot.startTime ? `${shoot.startTime} - ` : ''}{shoot.client.businessName}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/10 border-blue-500 text-blue-200';
      case 'CONFIRMED': return 'bg-purple-500/10 border-purple-500 text-purple-200';
      case 'IN_PROGRESS': return 'bg-amber-500/10 border-amber-500 text-amber-200';
      case 'COMPLETED': return 'bg-emerald-500/10 border-emerald-500 text-emerald-200';
      case 'CANCELLED': return 'bg-red-500/10 border-red-500 text-red-200';
      case 'POSTPONED': return 'bg-orange-500/10 border-orange-500 text-orange-200';
      default: return 'bg-zinc-500/10 border-zinc-500 text-zinc-200';
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg overflow-hidden flex flex-col">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white min-w-[150px]">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex items-center bg-white/5 rounded-md p-1 border border-white/10">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} disabled={isPending} className="h-7 w-7 text-zinc-400 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleToday} disabled={isPending} className="h-7 px-3 text-xs text-zinc-400 hover:text-white">
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={isPending} className="h-7 w-7 text-zinc-400 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="hidden sm:flex gap-2">
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-400 font-normal">Scheduled</Badge>
          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-400 font-normal">Confirmed</Badge>
          <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-normal">In Progress</Badge>
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-normal">Completed</Badge>
        </div>
      </div>
      
      <CardContent className={`p-4 flex-1 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-zinc-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </CardContent>
      
      <ShootForm open={open} onOpenChange={setOpen} shoot={editingShoot} clients={clients} projects={projects} />
      
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
    </Card>
  );
}
