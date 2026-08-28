"use client";

import React, { useState, useTransition } from "react";
import { ModuleDetailsSection } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Plus, Loader2, CheckCircle2, Clock, Trash2, Link as LinkIcon, Camera, PlayCircle } from "lucide-react";
import { CalendarEvent, CalendarEventStatus, CalendarEventType } from "@prisma/client";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar";
import { toast } from "sonner";
import { format, isPast, isToday, parseISO } from "date-fns";

interface CalendarModuleProps {
  clientId: string;
  events: CalendarEvent[];
}

export function CalendarModule({ clientId, events }: CalendarModuleProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [platform, setPlatform] = useState("INSTAGRAM");
  const [caption, setCaption] = useState("");
  const [assetUrl, setAssetUrl] = useState("");

  const handleCreatePost = () => {
    if (!title || !date) {
      toast.error("Title and date are required");
      return;
    }

    startTransition(async () => {
      // Serialize extra fields into notes
      const notesData = JSON.stringify({ platform, caption, assetUrl });

      const result = await createCalendarEvent({
        title,
        date: new Date(date),
        eventType: "CONTENT_PUBLISHING",
        status: "SCHEDULED",
        clientId,
        notes: notesData,
      });

      if (result.success) {
        toast.success("Post scheduled successfully");
        setIsDialogOpen(false);
        // Reset form
        setTitle("");
        setDate("");
        setPlatform("INSTAGRAM");
        setCaption("");
        setAssetUrl("");
      } else {
        toast.error("Failed to schedule post");
      }
    });
  };

  const handleUpdateStatus = (id: string, newStatus: CalendarEventStatus) => {
    startTransition(async () => {
      const result = await updateCalendarEvent(id, { status: newStatus });
      if (result.success) {
        toast.success("Status updated");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return;
    
    startTransition(async () => {
      const result = await deleteCalendarEvent(id);
      if (result.success) {
        toast.success("Post deleted");
      }
    });
  };

  // Group events into Upcoming and Past
  const upcomingEvents = events.filter(e => e.status !== "COMPLETED" && e.status !== "CANCELLED").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = events.filter(e => e.status === "COMPLETED").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderEventCard = (event: CalendarEvent) => {
    let extraData = { platform: "INSTAGRAM", caption: "", assetUrl: "" };
    try {
      if (event.notes) extraData = JSON.parse(event.notes);
    } catch (e) {}

    const isDone = event.status === "COMPLETED";

    return (
      <div key={event.id} className={`flex gap-4 p-5 rounded-xl border transition-all ${isDone ? 'bg-white/5 border-white/5 opacity-80' : 'bg-[#09090b] border-white/10 hover:border-white/20'}`}>
        
        {/* Date Box */}
        <div className={`flex flex-col items-center justify-center shrink-0 w-16 h-16 rounded-lg ${isDone ? 'bg-white/5 text-zinc-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
          <span className="text-xs font-bold uppercase">{format(new Date(event.date), "MMM")}</span>
          <span className="text-xl font-bold leading-none mt-1">{format(new Date(event.date), "dd")}</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {extraData.platform === "INSTAGRAM" ? (
                  <Camera className="w-4 h-4 text-rose-400" />
                ) : (
                  <PlayCircle className="w-4 h-4 text-red-500" />
                )}
                <h3 className={`text-base font-bold truncate ${isDone ? 'text-zinc-400' : 'text-white'}`}>{event.title}</h3>
                {event.status === "SCHEDULED" && <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px]">Scheduled</Badge>}
                {event.status === "COMPLETED" && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Published</Badge>}
              </div>
              
              {extraData.caption && (
                <p className="text-sm text-zinc-400 mt-2 line-clamp-2 pr-4">{extraData.caption}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {extraData.assetUrl && (
                <a href={extraData.assetUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="View Asset">
                  <LinkIcon className="w-4 h-4" />
                </a>
              )}
              
              {!isDone ? (
                <Button onClick={() => handleUpdateStatus(event.id, "COMPLETED")} size="sm" variant="ghost" className="h-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" disabled={isPending}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Published
                </Button>
              ) : (
                <Button onClick={() => handleUpdateStatus(event.id, "SCHEDULED")} size="sm" variant="ghost" className="h-8 text-zinc-500 hover:text-zinc-300 hover:bg-white/5" disabled={isPending}>
                  Revert
                </Button>
              )}
              
              <button onClick={() => handleDelete(event.id)} disabled={isPending} className="p-2 rounded-md hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 transition-colors ml-1" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ModuleDetailsSection>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-zinc-400" />
            Publishing Schedule
          </h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-white/10 text-white sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Schedule New Content</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="space-y-2">
                  <Label>Title / Campaign Name</Label>
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Summer Sale Reel" 
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Publish Date</Label>
                    <Input 
                      type="date"
                      value={date} 
                      onChange={e => setDate(e.target.value)} 
                      className="bg-white/5 border-white/10 text-white block w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#09090b] border-white/10 text-white">
                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                        <SelectItem value="YOUTUBE">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Google Drive / Asset Link</Label>
                  <Input 
                    value={assetUrl} 
                    onChange={e => setAssetUrl(e.target.value)} 
                    placeholder="https://drive.google.com/..." 
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Caption Copy</Label>
                  <Textarea 
                    value={caption} 
                    onChange={e => setCaption(e.target.value)} 
                    placeholder="Write your caption here..." 
                    className="min-h-[100px] bg-white/5 border-white/10 text-white resize-none"
                  />
                </div>

              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                <Button onClick={handleCreatePost} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-8">
          
          {/* UPCOMING */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Upcoming
            </h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                <CalendarIcon className="w-8 h-8 text-zinc-600 mb-3" />
                <p className="text-zinc-400 text-sm">No upcoming posts scheduled.</p>
              </div>
            )}
          </div>

          {/* PAST */}
          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Published
              </h3>
              <div className="space-y-3">
                {pastEvents.map(renderEventCard)}
              </div>
            </div>
          )}

        </div>
      </ModuleDetailsSection>
    </div>
  );
}
