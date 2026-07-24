import { z } from "zod";
import { DeliverableStatus, DeliverablePriority, ReviewStatus } from "@prisma/client";

export const createDeliverableSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  type: z.string().min(2, "Type must be at least 2 characters"),
  assignedEditor: z.string().nullable().optional(),
  status: z.nativeEnum(DeliverableStatus).optional(),
  priority: z.nativeEnum(DeliverablePriority).optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const updateDeliverableSchema = z.object({
  type: z.string().min(2, "Type must be at least 2 characters").optional(),
  assignedEditor: z.string().nullable().optional(),
  status: z.nativeEnum(DeliverableStatus).optional(),
  priority: z.nativeEnum(DeliverablePriority).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  completionDate: z.coerce.date().nullable().optional(),
  
  reviewStatus: z.nativeEnum(ReviewStatus).optional(),
  reviewDate: z.coerce.date().nullable().optional(),
  reviewerNotes: z.string().nullable().optional(),
});

export const addDeliverableFileSchema = z.object({
  deliverableId: z.string().min(1, "Deliverable ID is required"),
  name: z.string().min(1, "File name is required"),
  url: z.string().url("Must be a valid URL"),
  sizeBytes: z.number().int().positive().nullable().optional(),
});

export const addDeliverableVersionSchema = z.object({
  deliverableId: z.string().min(1, "Deliverable ID is required"),
  changeNotes: z.string().min(1, "Change notes are required"),
});
