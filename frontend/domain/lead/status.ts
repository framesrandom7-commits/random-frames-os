import { LeadStatus } from "@prisma/client";

export const ACTIVE_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.REQUIREMENT_DISCUSSION,
  LeadStatus.QUOTE_SENT,
  LeadStatus.NEGOTIATION,
  LeadStatus.QUOTE_APPROVED,
  LeadStatus.ADVANCE_PENDING
];

export const CONVERTED_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.CONVERTED
];

export const LOST_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.LOST
];
