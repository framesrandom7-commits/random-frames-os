"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, LeadFormData } from "@/lib/validations/lead";
import { createLead } from "@/app/actions/lead";
import { checkUniqueContact } from "@/app/actions/validation";
import { LeadStatus, LeadPriority, LeadSource, BusinessType, ReminderType, PreferredContact } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

const SERVICES_REQUIRED = [
  "Photos",
  "Reels",
  "Cinematic Reel",
  "Short Form Video",
  "Long Form Video",
  "Drone Footage",
  "Raw Footage",
  "Behind the Scenes (BTS)",
  "Editing",
  "Other"
];

const AUTOSAVE_KEY = "new-lead-draft";

import { DynamicFieldRenderer } from "@/components/forms/dynamic-field-renderer";

import { cn } from "@/lib/utils";

export function NewLeadForm({ customFields = [], className }: { customFields?: any[], className?: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const form = useForm<any>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      businessName: "",
      contactPerson: "",
      email: "",
      phone: "",
      whatsapp: "",
      website: "",
      instagram: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      businessType: undefined,
      leadSource: undefined,
      status: undefined,
      priority: undefined,
      reminderType: undefined,
      tags: [],
      notes: "",
      serviceInterested: "",
      preferredContactMethod: null,
      closingRemarks: "",
      customFields: {},
    }
  });

  const { register, handleSubmit, formState: { errors, isDirty }, setValue, watch, getValues, reset, setError, clearErrors } = form;
  // eslint-disable-next-line react-hooks/incompatible-library
  const businessType = watch("businessType");
  const leadSource = watch("leadSource");
  const status = watch("status");
  const priority = watch("priority");
  const reminderType = watch("reminderType");
  const preferredContactMethod = watch("preferredContactMethod");
  const tags = watch("tags") || [];
  const serviceInterested = watch("serviceInterested");

  // 1. Load Draft on Mount
  useEffect(() => {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.reminderDate) parsed.reminderDate = new Date(parsed.reminderDate);
        reset(parsed);
        toast.info("Restored from unsaved draft");
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [reset]);

  // 2. Autosave every 30 seconds if dirty
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirty) {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(getValues()));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, getValues]);

  // 3. Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Duplicate Check
  const checkDuplicates = useCallback(async () => {
    const email = getValues("email");
    const phone = getValues("phone");
    
    setDuplicateWarning(null);

    if (email) {
      const emailResult = await checkUniqueContact("email", email);
      if (!emailResult.isUnique) {
        setError("email", { type: "manual", message: `Email already exists in ${emailResult.conflictingEntity}` });
      } else if (form.formState.errors.email?.type === "manual") {
        clearErrors("email");
      }
    }

    if (phone) {
      const phoneResult = await checkUniqueContact("phone", phone);
      if (!phoneResult.isUnique) {
        setError("phone", { type: "manual", message: `Phone already exists in ${phoneResult.conflictingEntity}` });
      } else if (form.formState.errors.phone?.type === "manual") {
        clearErrors("phone");
      }
    }
  }, [getValues, setError, clearErrors, form.formState.errors]);

  const onSubmit = async (data: LeadFormData, addAnother: boolean = false) => {
    setIsSubmitting(true);
    try {
      const result = await createLead(data);
      if (result) {
        toast.success("Lead created successfully");
        localStorage.removeItem(AUTOSAVE_KEY);
        // We reset form state completely so `isDirty` becomes false
        reset(); 
        
        if (addAnother) {
          // Stay on page, clean slate
        } else {
          router.push(`/leads/${result.id}`);
        }
      } else {
        toast.error("Failed to create lead");
      }
    } catch (error) {
      toast.error("Network or server error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    if (isDirty && !window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
      return;
    }
    localStorage.removeItem(AUTOSAVE_KEY);
    router.push("/leads");
  }, [isDirty, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCancel]);

  const saveDraft = () => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(getValues()));
    toast.success("Draft saved successfully");
  };

  const handleServiceChange = (service: string, checked: boolean) => {
    const currentTags = getValues("tags") || [];
    if (checked) {
      setValue("tags", [...currentTags, service], { shouldDirty: true });
    } else {
      setValue("tags", currentTags.filter((t: string) => t !== service), { shouldDirty: true });
    }
  };

  return (
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {duplicateWarning && (
        <div className="bg-amber-500/10 border border-amber-500/50 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-500">{duplicateWarning}</p>
        </div>
      )}

      {/* A. Contact Information */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">A. Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson" className="text-zinc-300">Contact Person <span className="text-red-500">*</span></Label>
            <Input id="contactPerson" {...register("contactPerson")} className="bg-white/5 border-white/10 text-white" />
            {errors.contactPerson && <p className="text-xs text-red-400">{errors.contactPerson.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-zinc-300">Business Name</Label>
            <Input id="businessName" {...register("businessName")} className="bg-white/5 border-white/10 text-white" />
            {errors.businessName && <p className="text-xs text-red-400">{errors.businessName.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-zinc-300">Phone <span className="text-red-500">*</span></Label>
            <Input id="phone" {...register("phone")} onBlur={checkDuplicates} className="bg-white/5 border-white/10 text-white" />
            {errors.phone && <p className="text-xs text-red-400">{errors.phone.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp</Label>
            <Input id="whatsapp" {...register("whatsapp")} className="bg-white/5 border-white/10 text-white" />
            {errors.whatsapp && <p className="text-xs text-red-400">{errors.whatsapp.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input id="email" {...register("email")} onBlur={checkDuplicates} className="bg-white/5 border-white/10 text-white" />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-zinc-300">Website</Label>
            <Input id="website" {...register("website")} placeholder="https://" className="bg-white/5 border-white/10 text-white" />
            {errors.website && <p className="text-xs text-red-400">{errors.website.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-zinc-300">Instagram</Label>
            <Input id="instagram" {...register("instagram")} placeholder="@handle" className="bg-white/5 border-white/10 text-white" />
            {errors.instagram && <p className="text-xs text-red-400">{errors.instagram.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Preferred Contact Method</Label>
            <Select onValueChange={(v) => setValue("preferredContactMethod", v as PreferredContact)} value={preferredContactMethod || undefined}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {Object.values(PreferredContact).map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-200 focus:bg-white/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* B. Business Information */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">B. Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Business Type</Label>
            <Select onValueChange={(v) => setValue("businessType", v as BusinessType)} value={businessType}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {Object.values(BusinessType).map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-200 focus:bg-white/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="text-zinc-300">Address</Label>
            <Input id="address" {...register("address")} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-zinc-300">City</Label>
            <Input id="city" {...register("city")} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-zinc-300">State</Label>
            <Input id="state" {...register("state")} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-zinc-300">Country</Label>
            <Input id="country" {...register("country")} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-zinc-300">Pincode</Label>
            <Input id="postalCode" {...register("postalCode")} className="bg-white/5 border-white/10 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Service Interested In</Label>
            <Select onValueChange={(v) => setValue("serviceInterested", v)} value={serviceInterested || ""}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {SERVICES_REQUIRED.map((s) => (
                  <SelectItem key={s} value={s} className="text-zinc-200 focus:bg-white/10">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* C. Lead Details */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">C. Lead Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Source</Label>
            <Select onValueChange={(v) => setValue("leadSource", v as LeadSource)} value={leadSource}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {Object.values(LeadSource).map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-200 focus:bg-white/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Status</Label>
            <Select onValueChange={(v) => setValue("status", v as LeadStatus)} value={status}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {Object.values(LeadStatus).map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-200 focus:bg-white/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Priority</Label>
            <Select onValueChange={(v) => setValue("priority", v as LeadPriority)} value={priority}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {Object.values(LeadPriority).map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-200 focus:bg-white/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* D. Services Required */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">D. Services Required</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICES_REQUIRED.map((service) => (
            <div key={service} className="flex items-center space-x-2">
              <Checkbox 
                id={`service-${service}`} 
                checked={tags?.includes(service)}
                onChange={(e) => handleServiceChange(service, e.target.checked)}
                className="border-white/20 data-[state=checked]:bg-[#C1121F] data-[state=checked]:text-white"
              />
              <Label htmlFor={`service-${service}`} className="text-zinc-300 cursor-pointer">{service}</Label>
            </div>
          ))}
        </div>
      </section>

      {/* E. Notes */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">E. Notes</h3>
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-zinc-300">Client Requirements & Internal Notes</Label>
          <Textarea 
            id="notes" 
            {...register("notes")} 
            className="bg-white/5 border-white/10 text-white min-h-[100px]" 
            placeholder="Type any specific requirements, pain points, or internal context here..."
          />
        </div>
      </section>

      {/* F. Follow-up */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">F. Follow-up</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Reminder Type</Label>
            <Select onValueChange={(v) => setValue("reminderType", v as ReminderType)} value={reminderType || undefined}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="- - -" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10">
                {Object.values(ReminderType).map((t) => (
                  <SelectItem key={t} value={t} className="text-zinc-200 focus:bg-white/10">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminderDate" className="text-zinc-300">Date</Label>
            <Input 
              id="reminderDate" 
              type="date" 
              onChange={(e) => setValue("reminderDate", e.target.value ? new Date(e.target.value) : null)}
              className="bg-white/5 border-white/10 text-white" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminderTime" className="text-zinc-300">Time</Label>
            <Input 
              id="reminderTime" 
              type="time" 
              {...register("reminderTime")}
              className="bg-white/5 border-white/10 text-white" 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget" className="text-zinc-300">Budget</Label>
          <Input placeholder="Enter amount" {...form.register("budget")} type="number" className="bg-white/5 border-white/10 text-white" />
        </div>

        {customFields.length > 0 && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
            <DynamicFieldRenderer
              fields={customFields}
              formData={form.getValues()}
              setFormData={(data) => {
                Object.entries(data).forEach(([key, value]) => {
                  if (key === 'customFields') {
                     form.setValue('customFields', value, { shouldDirty: true });
                  }
                });
              }}
              errors={form.formState.errors.customFields as any}
            />
          </div>
        )}
      </section>

      {/* G. Attachments */}
      <section className="space-y-4 bg-zinc-900 border border-white/10 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-white border-b border-white/5 pb-2">G. Attachments</h3>
        <FileUpload 
          onUpload={(files) => {
            // Note: Since real storage isn't wired up, we just visually accept them.
            // A production implemention would upload these files and store the URLs to attach to the lead.
            toast.success(`${files.length} file(s) attached (Mocked for now)`);
          }} 
        />
      </section>
      </div> {/* End scrollable area */}

      {/* Actions */}
      <div className="shrink-0 p-4 bg-zinc-900 border-t border-white/10 flex items-center justify-end gap-3 z-50">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={handleCancel}
          className="text-zinc-400 hover:text-white"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={saveDraft}
          className="border-white/10 text-zinc-300 hover:bg-white/5"
        >
          Save Draft
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit((data) => onSubmit(data, true))}
          disabled={isSubmitting}
          className="bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save & Add Another
        </Button>
        <Button 
          type="button" 
          onClick={handleSubmit((data) => onSubmit(data, false))}
          disabled={isSubmitting}
          className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Save Lead
        </Button>
      </div>
    </form>
  );
}
