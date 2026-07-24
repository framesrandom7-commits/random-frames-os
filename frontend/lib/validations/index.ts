import { z } from "zod";
import { BusinessType } from "@prisma/client";

// Core Reusable Primitives
export const PaginationSchema = z.object({
  skip: z.number().int().nonnegative().optional().default(0),
  take: z.number().int().positive().max(100).optional().default(20),
  orderBy: z.string().optional(),
  sortDesc: z.boolean().optional().default(true),
});

export const OptionalString = z.string().trim().optional().nullable();

export const EmailSchema = z.string().email("Invalid email format").optional().nullable();
export const PhoneSchema = z.string().min(5, "Phone number too short").optional().nullable();

// Client Schemas
export const CreateClientSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactPerson: OptionalString,
  phone: PhoneSchema,
  email: EmailSchema,
  instagram: OptionalString,
  website: OptionalString,
  address: OptionalString,
  city: OptionalString,
  state: OptionalString,
  country: OptionalString,
  postalCode: OptionalString,
  businessType: z.nativeEnum(BusinessType).optional().nullable(),
  gstNumber: OptionalString,
  notes: OptionalString,
});

export const UpdateClientSchema = CreateClientSchema.partial();

// Lead Schemas
export const CreateLeadSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  contactPerson: OptionalString,
  email: EmailSchema,
  phone: PhoneSchema,
  source: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  priority: z.string().optional().nullable(),
  notes: OptionalString,
  budget: z.number().optional().nullable(),
  eventDate: z.date().optional().nullable(),
  projectType: OptionalString,
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

// Project Schemas
export const CreateProjectSchema = z.object({
  title: z.string().min(2, "Project title is required"),
  description: OptionalString,
  clientId: z.string().uuid("Invalid client ID"),
  status: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

// Finance Schemas
export const CreateInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  projectId: z.string().uuid().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  notes: OptionalString,
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
    taxRate: z.number().nonnegative().optional(),
  })).min(1),
});

export const CreateExpenseSchema = z.object({
  amount: z.number().positive(),
  date: z.date(),
  description: z.string().min(2),
  categoryId: z.string().uuid(),
  clientId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
});

// Communication Schemas
export const SendCommunicationSchema = z.object({
  type: z.enum(["EMAIL", "MESSAGE"]),
  direction: z.enum(["INBOUND", "OUTBOUND", "INTERNAL"]).optional().default("OUTBOUND"),
  subject: OptionalString,
  body: z.string().min(1),
  clientId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  leadId: z.string().uuid().optional().nullable(),
  recipientEmail: EmailSchema,
  recipientPhone: PhoneSchema,
});
