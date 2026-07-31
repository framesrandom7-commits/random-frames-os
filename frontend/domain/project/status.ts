import { ProjectStatus } from "@prisma/client";

export const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.PLANNING,
  ProjectStatus.SCHEDULED,
  ProjectStatus.SHOOT_COMPLETED,
  ProjectStatus.EDITING,
  ProjectStatus.CLIENT_REVIEW,
  ProjectStatus.DELIVERED
];

export const ARCHIVED_PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.COMPLETED,
  ProjectStatus.CANCELLED
];

export const EDITABLE_PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.PLANNING,
  ProjectStatus.SCHEDULED,
  ProjectStatus.SHOOT_COMPLETED,
  ProjectStatus.EDITING,
  ProjectStatus.CLIENT_REVIEW
];

export const DELIVERABLE_PROJECT_STATUSES: ProjectStatus[] = [
  ProjectStatus.EDITING,
  ProjectStatus.CLIENT_REVIEW,
  ProjectStatus.DELIVERED
];
