import { ShootStatus } from "@prisma/client";

export const ACTIVE_SHOOT_STATUSES: ShootStatus[] = [
  ShootStatus.UPCOMING
];

export const ARCHIVED_SHOOT_STATUSES: ShootStatus[] = [
  ShootStatus.COMPLETED,
  ShootStatus.CANCELLED
];
