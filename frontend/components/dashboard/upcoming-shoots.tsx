import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { getShoots } from "@/app/actions/shoot";
import { ActivityFeed, ActivityFeedItem } from "@/components/dashboard/components/activity-feed";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export default async function UpcomingShoots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { shoots: allUpcoming } = await getShoots({ 
    limit: 10, 
    dateStart: today,
    sortBy: "date",
    sortOrder: "asc",
  });

  const validShoots = allUpcoming.filter(s => s.status !== "CANCELLED" && s.status !== "POSTPONED").slice(0, 5);

  const items: ActivityFeedItem[] = validShoots.map(shoot => ({
    id: shoot.id,
    title: shoot.title,
    description: shoot.location || "Location TBD",
    timestamp: shoot.date ? new Date(shoot.date) : "TBD",
    icon: Calendar,
    status: "pending",
    href: `/shoots/${shoot.id}`
  }));

  return (
    <ActivityFeed 
      title="Upcoming Shoots" 
      items={items} 
      emptyMessage="No upcoming shoots scheduled."
      className="h-full"
      actions={
        <Link href="/shoots?view=calendar" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          View Calendar
        </Link>
      }
    />
  );
}
