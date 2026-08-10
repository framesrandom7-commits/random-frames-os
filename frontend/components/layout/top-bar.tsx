"use client";

import React from "react";
import { Search, Menu } from "lucide-react";
import { useCommand } from "@/components/providers/command-provider";
import UserProfile from "@/components/dashboard/user-profile";
import NotificationButton from "@/components/dashboard/notification-button";
import { LiveClock } from "@/components/layout/live-clock";
import { useNavigation } from "@/components/navigation/navigation-context";
import { useDeviceType } from "@/hooks/use-breakpoints";

export function TopBar({ user }: { user?: { name: string, roleName: string } }) {
  const { toggle } = useCommand();
  const { setDrawerOpen } = useNavigation();
  const deviceType = useDeviceType();

  return (
    <div className="sticky top-0 z-40 w-full bg-[#0F1115]/95 backdrop-blur-3xl border-b border-white/[0.08] shadow-sm">
      <div className="flex w-full items-center justify-between px-6 lg:px-8 h-24 lg:h-28">

        {/* Hamburger Menu (Tablet/Mobile) */}
        {(deviceType === "tablet" || deviceType === "mobile") && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 mr-4 rounded-xl bg-[#171A21]/80 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors focus:outline-none shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Portal Target for Module Titles & Greetings */}
        <div id="topbar-title-portal" className="flex-1 flex items-center gap-4 min-w-0" />

        {/* Global Actions */}
        <div className="flex items-center bg-[#171A21]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-full p-2 h-14 shrink-0 ml-4">
          <LiveClock />
          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          <NotificationButton />
          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          <UserProfile user={user} />
        </div>
      </div>
    </div>
  );
}
