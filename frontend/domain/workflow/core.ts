import { LeadStatus, ProjectStatus, ShootStatus } from "@prisma/client";

/**
 * Single Source of Truth for the global lifecycle of a job in Random Frames OS.
 * The high-level workflow is:
 * Lead -> Client/Project -> Shoot -> Editing -> Review -> Delivery -> Completed
 */
export const GLOBAL_WORKFLOW = {
  LEAD_PHASE: {
    order: 1,
    name: "Lead",
    description: "Initial contact and negotiation",
    isTerminal: false,
  },
  PROJECT_PLANNING: {
    order: 2,
    name: "Project Planning",
    description: "Project created, planning details",
    isTerminal: false,
  },
  SHOOT: {
    order: 3,
    name: "Shoot",
    description: "Shoot scheduled and in progress",
    isTerminal: false,
  },
  POST_PRODUCTION: {
    order: 4,
    name: "Editing",
    description: "Post-production and editing phase",
    isTerminal: false,
  },
  REVIEW: {
    order: 5,
    name: "Client Review",
    description: "Waiting on client feedback",
    isTerminal: false,
  },
  DELIVERY: {
    order: 6,
    name: "Delivery",
    description: "Final files delivered to client",
    isTerminal: false,
  },
  COMPLETED: {
    order: 7,
    name: "Completed",
    description: "Job successfully concluded",
    isTerminal: true,
  }
};

export const LEAD_FUNNEL_ORDER = [
  "NEW", 
  "CONTACTED", 
  "REQUIREMENT_DISCUSSION", 
  "QUOTE_SENT", 
  "NEGOTIATION", 
  "QUOTE_APPROVED",
  "ADVANCE_PENDING", 
  "CONVERTED", 
  "LOST"
];

/**
 * Calculates the overall progress (0-100) based on the current Project status.
 * Used uniformly across Dashboard, Workspaces, and Reports.
 */
export function calculateProjectProgress(status: ProjectStatus): number {
  switch (status) {
    case ProjectStatus.PLANNING:
      return 10;
    case ProjectStatus.SCHEDULED:
      return 25;
    case ProjectStatus.SHOOT_COMPLETED:
      return 50;
    case ProjectStatus.EDITING:
      return 70;
    case ProjectStatus.CLIENT_REVIEW:
      return 85;
    case ProjectStatus.DELIVERED:
      return 95;
    case ProjectStatus.COMPLETED:
      return 100;
    case ProjectStatus.CANCELLED:
      return 0;
    default:
      return 0;
  }
}

export function calculateShootProgress(status: ShootStatus): number {
  switch (status) {
    case ShootStatus.UPCOMING:
      return 50;
    case ShootStatus.COMPLETED:
      return 100;
    case ShootStatus.CANCELLED:
      return 0;
    default:
      return 20;
  }
}

export function calculateLeadProgress(status: LeadStatus): number {
  switch (status) {
    case LeadStatus.NEW:
      return 10;
    case LeadStatus.CONTACTED:
    case LeadStatus.NO_RESPONSE:
      return 20;
    case LeadStatus.REPLIED:
    case LeadStatus.INTERESTED:
      return 40;
    case LeadStatus.QUALIFIED:
    case LeadStatus.DISCOVERY:
      return 60;
    case LeadStatus.PROPOSAL:
    case LeadStatus.NEGOTIATION:
      return 80;
    case LeadStatus.WON:
    case LeadStatus.CLIENT:
      return 100;
    case LeadStatus.LOST:
    case LeadStatus.NOT_INTERESTED:
      return 0;
    case LeadStatus.FOLLOW_UP_LATER:
      return 30;
    default:
      return 50;
  }
}

export function calculateDeliverableProgress(status: any): number {
  switch (status) {
    case "PENDING":
      return 10;
    case "EDITING":
      return 50;
    case "READY_FOR_REVIEW":
    case "CHANGES_REQUESTED":
      return 80;
    case "APPROVED":
      return 95;
    case "DELIVERED":
      return 100;
    default:
      return 0;
  }
}
