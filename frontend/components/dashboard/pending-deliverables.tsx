import React from "react";
import { FileText } from "lucide-react";
import Link from "next/link";
import { DeliverableService } from "@/domain/services/DeliverableService";
import { ActivityFeed, ActivityFeedItem, ActivityItemStatus } from "@/components/dashboard/components/activity-feed";
import { buttonVariants } from "@/components/ui/button";

export default async function PendingDeliverables() {
  const deliverables = await DeliverableService.getContinueWorkingDeliverables(5);

  const getStatus = (status: string): ActivityItemStatus => {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'EDITING': return 'pending';
      case 'CHANGES_REQUESTED': return 'warning';
      default: return 'neutral';
    }
  };

  const getPriorityStr = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'High Priority';
      case 'MEDIUM': return 'Medium Priority';
      case 'LOW': return 'Low Priority';
      default: return '';
    }
  };

  const items: ActivityFeedItem[] = deliverables.map(item => ({
    id: item.id,
    title: item.type,
    description: `Shoot: ${item.shoot?.title} | ${getPriorityStr(item.priority)}`,
    timestamp: item.dueDate ? new Date(item.dueDate) : "No due date",
    icon: FileText,
    status: getStatus(item.status),
    href: `/shoots/${item.shootId}`
  }));

  return (
    <ActivityFeed 
      title="Pending Deliverables"
      items={items}
      emptyMessage="All deliverables are caught up."
      className="h-full"
      actions={
        <Link href="/shoots" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          View All
        </Link>
      }
    />
  );
}
