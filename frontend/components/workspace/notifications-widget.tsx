

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getNotifications } from "@/app/actions/notifications";
import NotificationsClient from "./notifications-client";
import Link from "next/link";

export default async function NotificationsWidget() {
  const notifications = await getNotifications({ status: "PENDING" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[#E53935] uppercase tracking-widest">
          Notifications
        </h2>
        <Link href="/notifications" className="text-[10px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">
          Mark all read
        </Link>
      </div>
      
      <div className="bg-[#171A21]/50 p-6 rounded-[24px] border border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
        <NotificationsClient initialNotifications={notifications} />
      </div>
    </div>
  );
}
