import { ProjectStatus } from "@prisma/client";
import { StatusMetadata } from "../types/metadata";

export function getProjectStatusMetadata(status: ProjectStatus): StatusMetadata {
  const metadata: Record<ProjectStatus, StatusMetadata> = {
    [ProjectStatus.PLANNING]: {
      label: "Planning",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: "Calendar",
      description: "Project is in the planning phase",
      order: 1,
      variant: "outline",
    },
    [ProjectStatus.SCHEDULED]: {
      label: "Scheduled",
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      icon: "CalendarClock",
      description: "Shoot dates are scheduled",
      order: 2,
      variant: "outline",
    },
    [ProjectStatus.SHOOT_COMPLETED]: {
      label: "Shoot Completed",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: "Camera",
      description: "All shooting is finished",
      order: 3,
      variant: "outline",
    },
    [ProjectStatus.EDITING]: {
      label: "Editing",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: "Video",
      description: "In post-production",
      order: 4,
      variant: "outline",
    },
    [ProjectStatus.CLIENT_REVIEW]: {
      label: "Client Review",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: "Eye",
      description: "Awaiting client feedback",
      order: 5,
      variant: "outline",
    },
    [ProjectStatus.DELIVERED]: {
      label: "Delivered",
      color: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      icon: "CheckCircle",
      description: "Files have been delivered",
      order: 6,
      variant: "outline",
    },
    [ProjectStatus.COMPLETED]: {
      label: "Completed",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: "CheckCircle2",
      description: "Project successfully finished",
      order: 7,
      variant: "outline",
    },
    [ProjectStatus.CANCELLED]: {
      label: "Cancelled",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: "XCircle",
      description: "Project was cancelled",
      order: 8,
      variant: "outline",
    },
  };

  return metadata[status];
}
