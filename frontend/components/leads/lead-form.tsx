"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LeadStatus, LeadPriority, LeadSource, BusinessType, ReminderType } from "@prisma/client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, LeadFormData, leadUpdateSchema, LeadUpdateFormData } from "@/lib/validations/lead";
import { createLead, updateLead } from "@/app/actions/lead";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: LeadFormData & { id?: string };
}

export default function LeadForm({ open, onOpenChange, lead }: LeadFormProps) {
  const isEditing = !!lead?.id;
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<LeadFormData>({
    resolver: zodResolver(isEditing ? leadUpdateSchema : leadSchema) as unknown as import("react-hook-form").Resolver<LeadFormData>,
    defaultValues: lead || {
      businessName: "",
      contactPerson: "",
      phone: "",
      email: "",
      instagram: "",
      website: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      businessType: BusinessType.OTHER,
      leadSource: LeadSource.OTHER,
      status: LeadStatus.NEW,
      priority: LeadPriority.MEDIUM,
      budget: null,
      currency: "USD",
      leadScore: 0,
      tags: [],
      notes: "",
      reminderDate: null,
      reminderTime: null,
      reminderType: null,
    }
  });

  React.useEffect(() => {
    if (open) {
      if (lead) {
        // Parse date for input type="date"
        let rDate = null;
        if (lead.reminderDate) {
          rDate = new Date(lead.reminderDate);
        }
        reset({ ...lead, reminderDate: rDate } as LeadFormData);
      } else reset({
        businessName: "",
        contactPerson: "",
        phone: "",
        email: "",
        instagram: "",
        website: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        businessType: BusinessType.OTHER,
        leadSource: LeadSource.OTHER,
        status: LeadStatus.NEW,
        priority: LeadPriority.MEDIUM,
        budget: null,
        currency: "USD",
        leadScore: 0,
        tags: [],
        notes: "",
        reminderDate: null,
        reminderTime: null,
        reminderType: null,
      } as LeadFormData);
    }
  }, [open, lead, reset]);

  const onSubmit = async (data: LeadFormData) => {
    try {
      if (isEditing && lead?.id) {
        await updateLead(lead.id, data as unknown as LeadUpdateFormData);
        toast.success("Lead updated successfully");
      } else {
        await createLead(data);
        toast.success("Lead created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update lead" : "Failed to create lead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#0a0a0a] border border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{isEditing ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-zinc-400">Business Name *</Label>
              <Input 
                id="businessName" 
                {...register("businessName")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
              {errors.businessName && <p className="text-red-500 text-sm">{String(errors.businessName.message)}</p>}
            </div>

            {/* Contact Person */}
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-zinc-400">Contact Person</Label>
              <Input 
                id="contactPerson" 
                {...register("contactPerson")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
              {errors.contactPerson && <p className="text-red-500 text-sm">{String(errors.contactPerson.message)}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-400">Phone</Label>
              <Input 
                id="phone" 
                {...register("phone")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
              {errors.email && <p className="text-red-500 text-sm">{String(errors.email.message)}</p>}
            </div>
            
            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-zinc-400">Instagram</Label>
              <Input 
                id="instagram" 
                {...register("instagram")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website" className="text-zinc-400">Website</Label>
              <Input 
                id="website" 
                {...register("website")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-zinc-400">Address</Label>
              <Input 
                id="address" 
                {...register("address")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-zinc-400">City</Label>
              <Input 
                id="city" 
                {...register("city")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-zinc-400">State / Province</Label>
              <Input 
                id="state" 
                {...register("state")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-zinc-400">Country</Label>
              <Input 
                id="country" 
                {...register("country")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-zinc-400">Postal Code</Label>
              <Input 
                id="postalCode" 
                {...register("postalCode")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-zinc-400">Business Type</Label>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 focus:ring-[#C1121F]">
                      <SelectValue placeholder="Select Business Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(BusinessType).map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Lead Source */}
            <div className="space-y-2">
              <Label htmlFor="leadSource" className="text-zinc-400">Lead Source</Label>
              <Controller
                name="leadSource"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 focus:ring-[#C1121F]">
                      <SelectValue placeholder="Select Source" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(LeadSource).map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-400">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 focus:ring-[#C1121F]">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(LeadStatus).map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-zinc-400">Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 focus:ring-[#C1121F]">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(LeadPriority).map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Budget */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="budget" className="text-zinc-400">Estimated Budget</Label>
              <div className="flex gap-2">
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-zinc-900/50 border-white/10 focus:ring-[#C1121F] w-[100px]">
                        <SelectValue placeholder="Cur" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="AUD">AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input 
                  id="budget"
                  type="number" 
                  step="0.01"
                  {...register("budget")} 
                  placeholder="e.g. 5000"
                  className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F] flex-1" 
                />
              </div>
            </div>

            {/* Reminders */}
            <div className="space-y-2">
              <Label htmlFor="reminderDate" className="text-zinc-400">Reminder Date</Label>
              <Controller
                name="reminderDate"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input 
                    type="date"
                    id="reminderDate"
                    className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
                    onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
                    value={value ? new Date(value).toISOString().split('T')[0] : ''}
                  />
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderTime" className="text-zinc-400">Reminder Time</Label>
              <Input 
                id="reminderTime"
                type="time" 
                {...register("reminderTime")} 
                className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F]" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reminderType" className="text-zinc-400">Reminder Type</Label>
              <Controller
                name="reminderType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className="bg-zinc-900/50 border-white/10 focus:ring-[#C1121F]">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(ReminderType).map(s => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-zinc-400">Notes / Requirements</Label>
            <Textarea 
              id="notes" 
              {...register("notes")} 
              className="bg-zinc-900/50 border-white/10 focus-visible:ring-[#C1121F] min-h-[100px]" 
            />
          </div>

          <DialogFooter className="pt-4 border-t border-white/5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 hover:bg-white/5 text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#C1121F] hover:bg-[#a00f1a] text-white font-medium"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
