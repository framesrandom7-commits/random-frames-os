import React from "react";
import Topbar from "@/components/dashboard/topbar";
import NotificationCenter from "@/components/notifications/notification-center";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <>
      <Topbar title="Notifications" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex items-center text-sm text-zinc-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Notifications</span>
        </div>
        
        <NotificationCenter />
      </main>
    </>
  );
}
