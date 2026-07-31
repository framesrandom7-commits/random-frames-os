import { z } from "zod";

const BusinessTypeEnum = z.enum(["CORPORATE", "WEDDING", "FASHION", "REAL_ESTATE", "EVENTS", "COMMERCIAL", "PORTRAIT", "OTHER"]);
const LeadSourceEnum = z.enum(["WEBSITE", "WHATSAPP", "INSTAGRAM", "FACEBOOK", "REFERRAL", "WALK_IN", "PHONE_CALL", "MANUAL", "OTHER"]);
const LeadStatusEnum = z.enum(["NEW", "CONTACTED", "REQUIREMENT_DISCUSSION", "QUOTE_SENT", "NEGOTIATION", "QUOTE_APPROVED", "ADVANCE_PENDING", "CONVERTED", "LOST"]);
const PreferredContactEnum = z.enum(["WHATSAPP", "PHONE", "EMAIL"]);
const LostReasonEnum = z.enum(["PRICE_TOO_HIGH", "CHOSE_ANOTHER_PHOTOGRAPHER", "BUDGET_ISSUES", "PROJECT_CANCELLED", "JUST_AN_ENQUIRY", "NO_RESPONSE", "TIMING_ISSUES", "NOT_INTERESTED", "DUPLICATE_LEAD", "OTHER"]);
const LeadPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
const ReminderTypeEnum = z.enum(["FOLLOW_UP", "MEETING", "CALL", "DEADLINE"]);

export const leadSchema = z.object({
  businessName: z.string().max(100).optional().nullable().or(z.literal("")),
  contactPerson: z.string().min(2, "Contact person is required and must be at least 2 characters").max(100),
  phone: z.string().max(50).regex(/^[+\d\s\-\(\)]+$/, "Invalid phone number format").optional().nullable().or(z.literal("")),
  whatsapp: z.string().max(50).regex(/^[+\d\s\-\(\)]+$/, "Invalid WhatsApp number format").optional().nullable().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().nullable().or(z.literal("")),
  instagram: z.string().max(100).regex(/^[@a-zA-Z0-9_\.]+$/, "Invalid Instagram handle format").optional().nullable().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  
  businessType: BusinessTypeEnum.default("OTHER"),
  serviceInterested: z.string().max(255).optional().nullable().or(z.literal("")),
  preferredContactMethod: PreferredContactEnum.optional().nullable(),
  leadSource: LeadSourceEnum.default("OTHER"),
  status: LeadStatusEnum.default("NEW"),
  priority: LeadPriorityEnum.default("MEDIUM"),
  
  budget: z.coerce.number().optional().nullable(),
  currency: z.string().max(10).default("USD"),
  
  leadScore: z.coerce.number().default(0),
  tags: z.array(z.string()).default([]), // Used for Services Required
  
  notes: z.string().max(2000).optional().nullable(),
  lastContactDate: z.date().optional().nullable(),
  nextFollowUpDate: z.date().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  ownerRemarks: z.string().max(2000).optional().nullable(),
  lostReason: LostReasonEnum.optional().nullable(),
  closingRemarks: z.string().max(2000).optional().nullable(),
  
  reminderDate: z.date().optional().nullable(),
  reminderTime: z.string().optional().nullable(),
  reminderType: ReminderTypeEnum.optional().nullable(),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  id: z.string().cuid(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
export type LeadUpdateFormData = z.infer<typeof leadUpdateSchema>;
