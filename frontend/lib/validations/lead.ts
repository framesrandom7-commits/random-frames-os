import { z } from "zod";
import { LeadStatus, LeadPriority, LeadSource, BusinessType, ReminderType } from "@prisma/client";

export const leadSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100),
  contactPerson: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  instagram: z.string().max(100).optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  
  businessType: z.nativeEnum(BusinessType).default(BusinessType.OTHER),
  leadSource: z.nativeEnum(LeadSource).default(LeadSource.OTHER),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  priority: z.nativeEnum(LeadPriority).default(LeadPriority.MEDIUM),
  
  budget: z.coerce.number().optional().nullable(),
  currency: z.string().max(10).default("USD"),
  
  leadScore: z.coerce.number().default(0),
  tags: z.array(z.string()).default([]), // Kept as array of strings for form input simplicity
  
  notes: z.string().max(2000).optional().nullable(),
  
  reminderDate: z.date().optional().nullable(),
  reminderTime: z.string().optional().nullable(),
  reminderType: z.nativeEnum(ReminderType).optional().nullable(),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  id: z.string().cuid(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
export type LeadUpdateFormData = z.infer<typeof leadUpdateSchema>;
