import { DeliverableStatus } from "@prisma/client";

export const ACTIVE_DELIVERABLE_STATUSES: DeliverableStatus[] = [
  DeliverableStatus.PENDING,
  DeliverableStatus.EDITING,
  DeliverableStatus.READY_FOR_REVIEW,
  DeliverableStatus.CHANGES_REQUESTED
];
