import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import NotificationCenter from "@/components/notifications/notification-center";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Notifications"
        subtitle="Stay updated with your latest alerts"
      />
      
      <NotificationCenter />
    </div>
  );
}
