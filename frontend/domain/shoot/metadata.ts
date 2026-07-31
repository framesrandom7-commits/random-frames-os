import { ShootStatus } from "@prisma/client";
import { StatusMetadata } from "../types/metadata";

export function getShootStatusMetadata(status: ShootStatus): StatusMetadata {
  const metadata: Record<ShootStatus, StatusMetadata> = {
    [ShootStatus.UPCOMING]: {
      label: "Upcoming",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: "CalendarClock",
      description: "Shoot is scheduled",
      order: 1,
      variant: "outline",
    },
    [ShootStatus.COMPLETED]: {
      label: "Completed",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: "CheckCircle2",
      description: "Shoot has been completed",
      order: 2,
      variant: "outline",
    },
    [ShootStatus.CANCELLED]: {
      label: "Cancelled",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: "XCircle",
      description: "Shoot was cancelled",
      order: 3,
      variant: "outline",
    },
  };

  return metadata[status];
}
