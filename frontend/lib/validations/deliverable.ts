import { z } from "zod";

const DeliverableStatusEnum = z.enum(["PENDING", "EDITING", "READY_FOR_REVIEW", "CHANGES_REQUESTED", "APPROVED", "DELIVERED"]);
const DeliverablePriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
const ReviewStatusEnum = z.enum(["NOT_SENT", "UNDER_REVIEW", "CHANGES_REQUESTED", "APPROVED"]);

export const createDeliverableSchema = z.object({
  shootId: z.string().min(1, "Shoot ID is required"),
  type: z.string().min(2, "Type must be at least 2 characters"),
  assignedEditor: z.string().nullable().optional(),
  status: DeliverableStatusEnum.optional(),
  priority: DeliverablePriorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

export const updateDeliverableSchema = z.object({
  type: z.string().min(2, "Type must be at least 2 characters").optional(),
  assignedEditor: z.string().nullable().optional(),
  status: DeliverableStatusEnum.optional(),
  priority: DeliverablePriorityEnum.optional(),
  dueDate: z.coerce.date().nullable().optional(),
  completionDate: z.coerce.date().nullable().optional(),
  
  reviewStatus: ReviewStatusEnum.optional(),
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
