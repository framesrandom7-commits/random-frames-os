import { z } from "zod";
import { LeadStatus, LeadPriority, LeadSource, BusinessType, ReminderType } from "@prisma/client";

export const leadSchema = z.object({
  businessName: z.string().min(2, "Business name is required and must be at least 2 characters").max(100),
  contactPerson: z.string().min(2, "Contact person is required and must be at least 2 characters").max(100),
  phone: z.string().min(7, "Phone number is required and must be at least 7 digits").max(50).regex(/^[+\d\s\-\(\)]+$/, "Invalid phone number format"),
  whatsapp: z.string().max(50).regex(/^[+\d\s\-\(\)]+$/, "Invalid WhatsApp number format").optional().nullable().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  instagram: z.string().max(100).regex(/^[@a-zA-Z0-9_\.]+$/, "Invalid Instagram handle format").optional().nullable().or(z.literal("")),
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
  tags: z.array(z.string()).default([]), // Used for Services Required
  
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
