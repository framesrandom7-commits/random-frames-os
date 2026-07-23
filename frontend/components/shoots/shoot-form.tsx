"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createShoot, updateShoot } from "@/app/actions/shoot";
import { toast } from "sonner";
import { Shoot, ShootType, ShootStatus } from "@prisma/client";

interface ShootFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shoot?: Shoot;
  prefilledClientId?: string;
  prefilledProjectId?: string;
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function ShootForm({ open, onOpenChange, shoot, prefilledClientId, prefilledProjectId, clients, projects }: ShootFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<Shoot>>({});
  
  // Filter projects based on selected client
  const [filteredProjects, setFilteredProjects] = useState<{ id: string; title: string; clientId: string }[]>([]);

  useEffect(() => {
    if (shoot && open) {
      // eslint-disable-next-line
      setFormData(shoot);
    } else if (open) {
      let defaultClientId = prefilledClientId || undefined;
      const defaultProjectId = prefilledProjectId || undefined;

      // If project is provided but no client, resolve client from project
      if (defaultProjectId && !defaultClientId) {
        const p = projects.find(x => x.id === defaultProjectId);
        if (p) defaultClientId = p.clientId;
      }

      setFormData({
        shootType: "OTHER",
        status: "PLANNED",
        clientId: defaultClientId,
        projectId: defaultProjectId,
      });
    }
  }, [shoot, open, prefilledClientId, prefilledProjectId, projects]);

  useEffect(() => {
    if (formData.clientId) {
      // eslint-disable-next-line
      setFilteredProjects(projects.filter(p => p.clientId === formData.clientId));
      // If the currently selected project doesn't belong to the newly selected client, clear it
      if (formData.projectId && !projects.find(p => p.id === formData.projectId && p.clientId === formData.clientId)) {
        setFormData(prev => ({ ...prev, projectId: undefined }));
      }
    } else {
      setFilteredProjects([]);
    }
  }, [formData.clientId, projects, formData.projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? new Date(value) : null }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) return toast.error("Shoot Title is required");
    if (!formData.clientId) return toast.error("Client is required");
    if (!formData.projectId) return toast.error("Project is required");

    startTransition(async () => {
      const dataToSubmit = {
        title: formData.title!,
        clientId: formData.clientId!,
        projectId: formData.projectId!,
        shootType: formData.shootType as ShootType,
        status: formData.status as ShootStatus,
        date: formData.date ? new Date(formData.date) : null,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        googleMapsLink: formData.googleMapsLink,
        photographer: formData.photographer,
        videographer: formData.videographer,
        assistants: formData.assistants,
        droneOperator: formData.droneOperator,
        editor: formData.editor,
        makeupArtist: formData.makeupArtist,
        callTime: formData.callTime,
        wrapTime: formData.wrapTime,
        timeZone: formData.timeZone,
        clientBrief: formData.clientBrief,
        specialRequests: formData.specialRequests,
        moodBoard: formData.moodBoard,
        referenceImages: formData.referenceImages,
        deliverablesChecklist: formData.deliverablesChecklist,
        weatherNotes: formData.weatherNotes,
        notes: formData.notes,
      };

      if (shoot?.id) {
        const result = await updateShoot(shoot.id, dataToSubmit);
        if (result.success) {
          toast.success("Shoot updated successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update shoot");
        }
      } else {
        const result = await createShoot(dataToSubmit);
        if (result.success) {
          toast.success("Shoot created successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create shoot");
        }
      }
    });
  };

  const formatDateForInput = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{shoot ? "Edit Shoot" : "Schedule New Shoot"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {shoot ? "Update the details of your scheduled shoot." : "Fill in the details to schedule a new shoot."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="text-zinc-300">Shoot Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Day 1: Interiors"
                value={formData.title || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-zinc-300">Client *</Label>
              <Select 
                value={formData.clientId || ""} 
                onValueChange={(val) => handleSelectChange("clientId", val || "")}
                disabled={!!prefilledClientId && !shoot} 
              >
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.businessName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId" className="text-zinc-300">Project *</Label>
              <Select 
                value={formData.projectId || ""} 
                onValueChange={(val) => handleSelectChange("projectId", val || "")}
                disabled={!formData.clientId || (!!prefilledProjectId && !shoot)} 
              >
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder={formData.clientId ? "Select a project" : "Select client first"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white max-h-60">
                  {filteredProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>{project.title}</SelectItem>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="p-2 text-sm text-zinc-500">No active projects</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Shoot Type</Label>
              <Select value={formData.shootType || ""} onValueChange={(val) => handleSelectChange("shootType", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(ShootType).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Status</Label>
              <Select value={formData.status || ""} onValueChange={(val) => handleSelectChange("status", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(ShootStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Schedule */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Schedule</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-zinc-300">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formatDateForInput(formData.date)}
                onChange={handleDateChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-zinc-300">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime || ""}
                  onChange={handleChange}
                  className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-zinc-300">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime || ""}
                  onChange={handleChange}
                  className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Location & Team */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Pre-Shoot Planning & Logistics</h4>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location" className="text-zinc-300">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Address or venue name"
                value={formData.location || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="googleMapsLink" className="text-zinc-300">Google Maps Link</Label>
              <Input
                id="googleMapsLink"
                name="googleMapsLink"
                placeholder="https://maps.google.com/..."
                value={formData.googleMapsLink || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photographer" className="text-zinc-300">Photographer(s)</Label>
              <Input
                id="photographer"
                name="photographer"
                placeholder="Names"
                value={formData.photographer || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="videographer" className="text-zinc-300">Videographer(s)</Label>
              <Input
                id="videographer"
                name="videographer"
                placeholder="Names"
                value={formData.videographer || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assistants" className="text-zinc-300">Assistants / Crew</Label>
              <Input
                id="assistants"
                name="assistants"
                placeholder="Names"
                value={formData.assistants || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Brief</h4>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clientBrief" className="text-zinc-300">Client Brief</Label>
              <Textarea
                id="clientBrief"
                name="clientBrief"
                placeholder="Specific instructions from the client..."
                value={formData.clientBrief || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weatherNotes" className="text-zinc-300">Weather Notes</Label>
              <Textarea
                id="weatherNotes"
                name="weatherNotes"
                placeholder="Sunny, indoor only, etc."
                value={formData.weatherNotes || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-zinc-300">Internal Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Any internal notes for the team..."
                value={formData.notes || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>
            {/* Requirements & Assets */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Requirements & Assets</h4>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="deliverablesChecklist" className="text-zinc-300">Deliverables Checklist</Label>
              <Textarea
                id="deliverablesChecklist"
                name="deliverablesChecklist"
                placeholder="What needs to be delivered? (e.g. 50 edited photos, 1 highlight reel)"
                value={formData.deliverablesChecklist || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="specialRequests" className="text-zinc-300">Special Requests</Label>
              <Textarea
                id="specialRequests"
                name="specialRequests"
                placeholder="Any special requests or constraints..."
                value={formData.specialRequests || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
              {isPending ? "Saving..." : shoot ? "Update Shoot" : "Schedule Shoot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
