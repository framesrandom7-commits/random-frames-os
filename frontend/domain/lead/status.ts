import { LeadStatus } from "@prisma/client";

export const ACTIVE_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.NO_RESPONSE,
  LeadStatus.REPLIED,
  LeadStatus.INTERESTED,
  LeadStatus.QUALIFIED,
  LeadStatus.DISCOVERY,
  LeadStatus.PROPOSAL,
  LeadStatus.NEGOTIATION,
  LeadStatus.FOLLOW_UP_LATER
];

export const CONVERTED_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.WON,
  LeadStatus.CLIENT
];

export const LOST_LEAD_STATUSES: LeadStatus[] = [
  LeadStatus.LOST,
  LeadStatus.NOT_INTERESTED
];
