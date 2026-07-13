"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, updateProject } from "@/app/actions/project";
import { toast } from "sonner";
import { Project, ProjectCategory, ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  prefilledClientId?: string;
  clients: { id: string; businessName: string }[];
}

export default function ProjectForm({ open, onOpenChange, project, prefilledClientId, clients }: ProjectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<Project>>({});

  useEffect(() => {
    if (project && open) {
      // eslint-disable-next-line
      setFormData(project);
    } else if (open) {
      setFormData({
        category: "OTHER",
        status: "INQUIRY",
        priority: "MEDIUM",
        paymentStatus: "PENDING",
        clientId: prefilledClientId || undefined,
      });
    }
  }, [project, open, prefilledClientId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs (Decimals in Prisma)
    if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: value ? parseFloat(value) : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    
    if (!formData.title) {
      toast.error("Project Title is required");
      return;
    }

    if (!formData.clientId) {
      toast.error("Client is required");
      return;
    }

    startTransition(async () => {
      const dataToSubmit = {
        title: formData.title!,
        clientId: formData.clientId!,
        description: formData.description,
        category: formData.category as ProjectCategory,
        status: formData.status as ProjectStatus,
        priority: formData.priority as ProjectPriority,
        paymentStatus: formData.paymentStatus as PaymentStatus,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : null,
        quotationAmount: formData.quotationAmount ? Number(formData.quotationAmount) : null,
        advanceAmount: formData.advanceAmount ? Number(formData.advanceAmount) : null,
        totalAmount: formData.totalAmount ? Number(formData.totalAmount) : null,
        balanceAmount: formData.balanceAmount ? Number(formData.balanceAmount) : null,
        notes: formData.notes,
      };

      if (project?.id) {
        const result = await updateProject(project.id, dataToSubmit);
        if (result.success) {
          toast.success("Project updated successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to update project");
        }
      } else {
        const result = await createProject(dataToSubmit);
        if (result.success) {
          toast.success("Project created successfully");
          onOpenChange(false);
        } else {
          toast.error(result.error || "Failed to create project");
        }
      }
    });
  };

  // Helper to format Date for date input
  const formatDateForInput = (date: any) => {
    if (!date) return "";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString().split('T')[0];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{project ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {project ? "Update the details of your project." : "Fill in the details to start a new project."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Core Info */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title" className="text-zinc-300">Project Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Summer Collection Shoot"
                value={formData.title || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="clientId" className="text-zinc-300">Client *</Label>
              <Select 
                value={formData.clientId || ""} 
                onValueChange={(val) => handleSelectChange("clientId", val || "")}
                disabled={!!prefilledClientId && !project} // Lock if creating directly from a client page
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description" className="text-zinc-300">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief project description..."
                value={formData.description || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            {/* Classification */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Category</Label>
              <Select value={formData.category || ""} onValueChange={(val) => handleSelectChange("category", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(ProjectCategory).map((cat) => (
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
                  {Object.values(ProjectStatus).map((status) => (
                    <SelectItem key={status} value={status}>{status.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Priority</Label>
              <Select value={formData.priority || ""} onValueChange={(val) => handleSelectChange("priority", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(ProjectPriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-zinc-300">Payment Status</Label>
              <Select value={formData.paymentStatus || ""} onValueChange={(val) => handleSelectChange("paymentStatus", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(PaymentStatus).map((ps) => (
                    <SelectItem key={ps} value={ps}>{ps}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Schedule</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-zinc-300">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={handleDateChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-zinc-300">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formatDateForInput(formData.endDate)}
                onChange={handleDateChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate" className="text-zinc-300">Delivery Date</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                value={formatDateForInput(formData.deliveryDate)}
                onChange={handleDateChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Finances */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Finances</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-zinc-300">Total Amount</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.totalAmount?.toString() || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quotationAmount" className="text-zinc-300">Quotation Amount</Label>
              <Input
                id="quotationAmount"
                name="quotationAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.quotationAmount?.toString() || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advanceAmount" className="text-zinc-300">Advance Paid</Label>
              <Input
                id="advanceAmount"
                name="advanceAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.advanceAmount?.toString() || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balanceAmount" className="text-zinc-300">Balance Due</Label>
              <Input
                id="balanceAmount"
                name="balanceAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.balanceAmount?.toString() || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2 mt-2">
              <Label htmlFor="notes" className="text-zinc-300">Internal Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes about this project..."
                value={formData.notes || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F] min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
              {isPending ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
