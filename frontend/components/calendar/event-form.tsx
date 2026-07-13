"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarEventType, CalendarEventStatus, Prisma } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar";

type EventType = Prisma.CalendarEventGetPayload<{}>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: EventType;
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
  initialDate?: Date;
}

export default function EventForm({ open, onOpenChange, event, clients, projects, initialDate }: EventFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: "",
    date: initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    isAllDay: false,
    startTime: "",
    endTime: "",
    eventType: "PERSONAL_REMINDER" as CalendarEventType,
    status: "SCHEDULED" as CalendarEventStatus,
    clientId: "none",
    projectId: "none",
    notes: "",
  });

  useEffect(() => {
    if (event) {
      // eslint-disable-next-line
      setFormData({
        title: event.title,
        date: new Date(event.date).toISOString().split("T")[0],
        isAllDay: event.isAllDay,
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        eventType: event.eventType,
        status: event.status,
        clientId: event.clientId || "none",
        projectId: event.projectId || "none",
        notes: event.notes || "",
      });
    } else {
      setFormData({
        title: "",
        date: initialDate ? initialDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        isAllDay: false,
        startTime: "",
        endTime: "",
        eventType: "PERSONAL_REMINDER",
        status: "SCHEDULED",
        clientId: "none",
        projectId: "none",
        notes: "",
      });
    }
  }, [event, initialDate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        title: formData.title,
        date: new Date(formData.date),
        isAllDay: formData.isAllDay,
        startTime: formData.isAllDay ? undefined : formData.startTime || undefined,
        endTime: formData.isAllDay ? undefined : formData.endTime || undefined,
        eventType: formData.eventType,
        status: formData.status,
        clientId: formData.clientId === "none" ? undefined : formData.clientId,
        projectId: formData.projectId === "none" ? undefined : formData.projectId,
        notes: formData.notes,
      };

      if (event) {
        await updateCalendarEvent(event.id, data);
      } else {
        await createCalendarEvent(data as any);
      }
      onOpenChange(false);
    });
  };

  const handleDelete = () => {
    if (!event) return;
    if (confirm("Are you sure you want to delete this event?")) {
      startTransition(async () => {
        await deleteCalendarEvent(event.id);
        onOpenChange(false);
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input 
              id="title" 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/40 border-white/10"
              placeholder="E.g., Team Meeting"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select 
                value={formData.eventType} 
                onValueChange={(v: any) => setFormData({ ...formData, eventType: v as CalendarEventType })}
                disabled={event?.eventType === "SHOOT" || event?.eventType === "DELIVERY"} // Prevent changing type for auto-synced events
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.values(CalendarEventType).map((type) => (
                    <SelectItem key={type} value={type}>{type.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v: any) => setFormData({ ...formData, status: v as CalendarEventStatus })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.values(CalendarEventStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input 
              id="date" 
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="bg-black/40 border-white/10"
            />
          </div>

          <div className="flex items-center space-x-2 bg-white/5 p-3 rounded-md border border-white/10">
            <Switch 
              id="isAllDay" 
              checked={formData.isAllDay}
              onCheckedChange={(checked) => setFormData({ ...formData, isAllDay: checked })}
            />
            <Label htmlFor="isAllDay">All Day Event</Label>
          </div>

          {!formData.isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-black/40 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-black/40 border-white/10"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client (Optional)</Label>
              <Select 
                value={formData.clientId || "none"} 
                onValueChange={(v: any) => setFormData({ ...formData, clientId: v })}
                disabled={!!event?.shootId || !!event?.leadId}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-40">
                  <SelectItem value="none">None</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectId">Project (Optional)</Label>
              <Select 
                value={formData.projectId || "none"} 
                onValueChange={(v: any) => setFormData({ ...formData, projectId: v })}
                disabled={!!event?.shootId || formData.clientId === "none"}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-40">
                  <SelectItem value="none">None</SelectItem>
                  {projects.filter(p => formData.clientId === "none" || p.clientId === formData.clientId).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-black/40 border-white/10 min-h-[80px]"
              placeholder="Any additional details..."
            />
          </div>

          <DialogFooter className="pt-4 flex !justify-between items-center w-full">
            {event && !event.shootId && !event.leadId ? (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isPending}
              >
                Delete
              </Button>
            ) : (
              <div></div>
            )}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="bg-transparent border-white/10 hover:bg-white/5 text-white"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
              >
                {isPending ? "Saving..." : "Save Event"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
