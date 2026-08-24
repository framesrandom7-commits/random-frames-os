"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ResponsiveFormGrid } from "@/components/ui/form/responsive-form-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject, updateProject } from "@/app/actions/project";
import { getLatestApprovedQuotation } from "@/app/actions/quotation";
import { toast } from "sonner";
import { Project, ProjectCategory, ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import QuickQuotationModal from "./quick-quotation-modal";

interface ProjectFormProps {
  project?: any;
  prefilledClientId?: string;
  clients?: any[];
  users?: any[];
  className?: string;
}

export default function ProjectForm({ project, prefilledClientId, clients = [], users = [], className }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<any> & { assignedUserIds?: string[] }>({});
  const [approvedQuotation, setApprovedQuotation] = useState<any>(null);
  const [isFetchingQuotation, setIsFetchingQuotation] = useState(false);
  const [noQuotationError, setNoQuotationError] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);

  useEffect(() => {
    if (project) {
       
      setFormData({
        ...project,
        assignedUserIds: (project as any).assignedUsers?.map((u: any) => u.id) || []
      });
    } else {
      setFormData({
        category: "ONE_TIME_SHOOT",
        status: "PLANNING",
        priority: "MEDIUM",
        paymentStatus: "PENDING",
        clientId: prefilledClientId || undefined,
        assignedUserIds: [],
      });
    }
  }, [project, prefilledClientId]);

  useEffect(() => {
    async function fetchQuotation() {
      if (formData.clientId && !project) {
        setIsFetchingQuotation(true);
        setNoQuotationError(false);
        const quotation = await getLatestApprovedQuotation(formData.clientId);
        if (quotation) {
          setApprovedQuotation(quotation);
          setFormData(prev => ({ 
            ...prev, 
            quotationId: quotation.id,
            quotationAmount: Number(quotation.total)
          }));
        } else {
          setApprovedQuotation(null);
          setNoQuotationError(true);
          setFormData(prev => ({ ...prev, quotationId: null, quotationAmount: 0 }));
        }
        setIsFetchingQuotation(false);
      }
    }
    fetchQuotation();
  }, [formData.clientId, project]);

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

    if (!project && noQuotationError) {
      toast.error("An approved quotation is required to create a project.");
      return;
    }

    startTransition(async () => {
      const quotationAmount = Number(formData.quotationAmount) || 0;
      const additionalServicesAmount = Number(formData.additionalServicesAmount) || 0;
      const additionalChargesAmount = Number(formData.additionalChargesAmount) || 0;
      const discountAmount = Number(formData.discountAmount) || 0;
      const advanceAmount = Number(formData.advanceAmount) || 0;
      
      const totalAmount = quotationAmount + additionalServicesAmount + additionalChargesAmount - discountAmount;
      const balanceAmount = totalAmount - advanceAmount;

      const dataToSubmit = {
        title: formData.title!,
        clientId: formData.clientId!,
        description: formData.description,
        category: formData.category as ProjectCategory,
        status: formData.status as ProjectStatus,
        priority: formData.priority as ProjectPriority,
        paymentStatus: formData.paymentStatus as PaymentStatus,
        quotationId: formData.quotationId,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        deliveryDate: formData.deliveryDate || null,
        quotationAmount,
        additionalServicesAmount,
        additionalChargesAmount,
        discountAmount,
        taxAmount: null,
        advanceAmount,
        totalAmount,
        balanceAmount,
        notes: formData.notes || null,
        assignedUserIds: formData.assignedUserIds || [],
      };

      if (project?.id) {
        const result = await updateProject(project.id, dataToSubmit);
        if (result.success) {
          toast.success("Project updated successfully");
          router.push(`/projects/${project.id}`);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update project");
        }
      } else {
        const result = await createProject(dataToSubmit);
        if (result.success) {
          toast.success("Project created successfully");
          router.push("/projects");
          router.refresh();
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
    <form onSubmit={handleSubmit} className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <SelectValue placeholder="- - -">
                    {formData.clientId ? clients.find(c => c.id === formData.clientId)?.businessName || "Loading..." : "Select Client"}
                  </SelectValue>
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
                  <SelectValue placeholder="- - -" />
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
                  <SelectValue placeholder="- - -" />
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
                  <SelectValue placeholder="- - -" />
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
                  <SelectValue placeholder="- - -" />
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
              <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Finances & Origin</h4>
            </div>

            {/* Warning Overlay if No Quotation */}
            {!project && noQuotationError && formData.clientId && (
              <div className="col-span-1 md:col-span-2 bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-red-400 font-semibold mb-1">No Approved Quotation Found</p>
                  <p className="text-zinc-300 text-sm">Every project requires an approved quotation. Please create and approve a quotation for this client first.</p>
                </div>
                <Button 
                  type="button" 
                  onClick={() => setIsQuotationModalOpen(true)}
                  className="bg-red-500 hover:bg-red-600 text-white shrink-0"
                >
                  Create Quotation
                </Button>
              </div>
            )}

            <QuickQuotationModal
              open={isQuotationModalOpen}
              onOpenChange={setIsQuotationModalOpen}
              clientId={formData.clientId}
              onSuccess={(quotationId, total) => {
                setIsQuotationModalOpen(false);
                setNoQuotationError(false);
                setApprovedQuotation({ quotationNumber: "NEW (Just Created)", version: 1, approvedAt: new Date(), approvalMethod: "VERBAL" });
                setFormData(prev => ({ ...prev, quotationId, quotationAmount: total }));
              }}
            />

            {/* Approved Quotation Read-Only Block */}
            {approvedQuotation && !project && (
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-lg border border-white/5 mb-4">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Quotation Number</p>
                  <p className="text-sm font-medium text-white">{approvedQuotation.quotationNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Revision Number</p>
                  <p className="text-sm font-medium text-white">v{approvedQuotation.version}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Approval Date</p>
                  <p className="text-sm font-medium text-white">{new Date(approvedQuotation.approvedAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Approval Method</p>
                  <p className="text-sm font-medium text-white">{approvedQuotation.approvalMethod || "N/A"}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quotationAmount" className="text-zinc-300">Quotation Value (Base)</Label>
              <Input
                id="quotationAmount"
                name="quotationAmount"
                type="number"
                disabled
                value={formData.quotationAmount || ""}
                className="bg-black/20 border-white/5 text-zinc-500 cursor-not-allowed"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalServicesAmount" className="text-zinc-300">Additional Services / Change Orders</Label>
              <Input
                id="additionalServicesAmount"
                name="additionalServicesAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.additionalServicesAmount || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalChargesAmount" className="text-zinc-300">Billable Expenses / Charges</Label>
              <Input
                id="additionalChargesAmount"
                name="additionalChargesAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.additionalChargesAmount || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountAmount" className="text-zinc-300">Discounts (-)</Label>
              <Input
                id="discountAmount"
                name="discountAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discountAmount || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount" className="text-zinc-300">Project Total (Calculated)</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                disabled
                value={(() => {
                  const sum = (Number(formData.quotationAmount) || 0) + (Number(formData.additionalServicesAmount) || 0) + (Number(formData.additionalChargesAmount) || 0) - (Number(formData.discountAmount) || 0);
                  return sum === 0 ? "" : sum.toFixed(2);
                })()}
                className="bg-black/20 border-white/5 text-zinc-400 font-bold cursor-not-allowed"
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
                value={formData.advanceAmount || ""}
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
                disabled
                value={(() => {
                  const sum = (Number(formData.quotationAmount) || 0) + (Number(formData.additionalServicesAmount) || 0) + (Number(formData.additionalChargesAmount) || 0) - (Number(formData.discountAmount) || 0) - (Number(formData.advanceAmount) || 0);
                  return sum === 0 ? "" : sum.toFixed(2);
                })()}
                className="bg-black/20 border-white/5 text-zinc-400 font-bold cursor-not-allowed"
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

          <div className="space-y-2 mt-4">
            <Label className="text-zinc-300">Assigned Team Members</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {users.map((user) => (
                <label 
                  key={user.id} 
                  className={`relative flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                    formData.assignedUserIds?.includes(user.id) 
                      ? "bg-white/10 border-white/20" 
                      : "bg-black/20 border-white/5 hover:bg-white/5"
                  }`}
                >
                  <input 
                    type="checkbox"
                    className="sr-only"
                    checked={formData.assignedUserIds?.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, assignedUserIds: [...(prev.assignedUserIds || []), user.id] }));
                      } else {
                        setFormData(prev => ({ ...prev, assignedUserIds: (prev.assignedUserIds || []).filter(id => id !== user.id) }));
                      }
                    }}
                  />
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-medium text-white uppercase border border-white/10">
                    {(user.name || user.email).charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-300 line-clamp-1">{user.name || user.email}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 p-4 bg-zinc-900 border-t border-white/10 flex justify-end gap-2 z-50">
            <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
              {isPending ? "Saving..." : project ? "Update Project" : "Create Project"}
            </Button>
          </div>
        </form>
  );
}
