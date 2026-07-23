"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { onboardClient, OnboardClientData } from "@/app/actions/client";
import { getLead } from "@/app/actions/lead";
import { toast } from "sonner";
import { ProjectCategory, ProjectPriority } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientOnboardingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string; // If provided, prefill data and link
}

export default function ClientOnboardingForm({ open, onOpenChange, leadId }: ClientOnboardingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingLead, setIsLoadingLead] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState<Partial<OnboardClientData>>({
    projectCategory: "OTHER",
    projectPriority: "MEDIUM",
  });

  useEffect(() => {
    const fetchLeadData = async () => {
      setIsLoadingLead(true);
      try {
        const lead = await getLead(leadId!);
        if (lead) {
          setFormData(prev => ({
            ...prev,
            businessName: lead.businessName,
            contactPerson: lead.contactPerson || "",
            phone: lead.phone || "",
            whatsapp: lead.phone || "",
            email: lead.email || "",
            instagram: lead.instagram || "",
            website: lead.website || "",
            address: lead.address || "",
            clientNotes: lead.notes || "",
          }));
        }
      } finally {
        setIsLoadingLead(false);
      }
    };

    if (open && leadId) {
      fetchLeadData();
    } else if (open) {
      // Reset form
      setTimeout(() => {
        setFormData({
          projectCategory: "OTHER",
          projectPriority: "MEDIUM",
        });
      }, 0);
    }
  }, [open, leadId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName || !formData.projectTitle) {
      toast.error("Business Name and Project Title are required.");
      return;
    }

    startTransition(async () => {
      const dataToSubmit = {
        leadId: leadId || "", 
        businessName: formData.businessName || "",
        contactPerson: formData.contactPerson || "",
        phone: formData.phone || "",
        whatsapp: formData.whatsapp || "",
        email: formData.email || "",
        instagram: formData.instagram || "",
        website: formData.website || "",
        address: formData.address || "",
        gstNumber: formData.gstNumber || "",
        clientNotes: formData.clientNotes || "",
        
        projectTitle: formData.projectTitle || "",
        projectCategory: formData.projectCategory || "OTHER",
        projectDescription: formData.projectDescription || "",
        deliverables: formData.deliverables || "",
        projectPriority: formData.projectPriority || "MEDIUM",
      };

      const result = await onboardClient(dataToSubmit);
      if (result.success) {
        toast.success("Client fully onboarded with Project!");
        onOpenChange(false);
        if (result.clientId) {
          router.push(`/clients/${result.clientId}`);
        }
      } else {
        toast.error(result.error || "Failed to onboard client");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white p-0">
        <DialogHeader className="p-6 pb-2 border-b border-white/10 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-md z-10">
          <DialogTitle className="text-2xl font-bold">Client Onboarding Wizard</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create Client and Initial Project.
          </DialogDescription>
        </DialogHeader>

        {isLoadingLead ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-12">
            
            {/* 1. CLIENT INFORMATION */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center border-b border-white/10 pb-2">
                1. Client Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name *</Label>
                  <Input required name="businessName" value={formData.businessName || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input name="contactPerson" value={formData.contactPerson || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" value={formData.phone || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input name="whatsapp" value={formData.whatsapp || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" value={formData.email || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Textarea name="address" value={formData.address || ""} onChange={handleChange} className="bg-black/50 border-white/10 min-h-[80px]" />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input name="gstNumber" value={formData.gstNumber || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input name="instagram" value={formData.instagram || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input name="website" value={formData.website || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Client Notes</Label>
                  <Textarea name="clientNotes" value={formData.clientNotes || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
              </div>
            </section>

            {/* 2. PROJECT INFORMATION */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-blue-400 flex items-center border-b border-white/10 pb-2">
                2. Project Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Project Title *</Label>
                  <Input required name="projectTitle" value={formData.projectTitle || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.projectCategory || "OTHER"} onValueChange={(v) => handleSelectChange("projectCategory", v)}>
                    <SelectTrigger className="bg-black/50 border-white/10"><SelectValue/></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(ProjectCategory).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.projectPriority || "MEDIUM"} onValueChange={(v) => handleSelectChange("projectPriority", v)}>
                    <SelectTrigger className="bg-black/50 border-white/10"><SelectValue/></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(ProjectPriority).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Project Description</Label>
                  <Textarea name="projectDescription" value={formData.projectDescription || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Deliverables (Client Requirements)</Label>
                  <Textarea name="deliverables" value={formData.deliverables || ""} onChange={handleChange} className="bg-black/50 border-white/10" />
                </div>
              </div>
            </section>

            {/* Shoot and Finance Information removed as per architecture rules */}

            <DialogFooter className="pt-8 border-t border-white/10 sticky bottom-0 bg-[#0a0a0a]/95 backdrop-blur-md p-4 mt-0 mx(-6)">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg w-40">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Onboard Client"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
