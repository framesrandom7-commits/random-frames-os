"use client";

import React from "react";
import { Search, Menu } from "lucide-react";
import { useCommand } from "@/components/providers/command-provider";
import UserProfile from "@/components/dashboard/user-profile";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";
import { useNavigation } from "@/components/navigation/navigation-context";
import { useDeviceType } from "@/hooks/use-breakpoints";

export function TopBar({ user }: { user?: { name: string, roleName: string } }) {
  const { toggle } = useCommand();
  const { setDrawerOpen } = useNavigation();
  const deviceType = useDeviceType();

  return (
    <div className="sticky top-0 z-40 w-full pointer-events-none h-0">
      <div className="flex w-full items-center justify-between gap-4 pointer-events-auto px-6 lg:px-8 pt-6 lg:pt-8">

        {/* Hamburger Menu (Tablet/Mobile) */}
        <div className="flex-1">
          {(deviceType === "tablet" || deviceType === "mobile") && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl bg-[#171A21]/80 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        {/* Global Actions */}
        <div className="flex items-center bg-[#171A21]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-full p-2 h-14">
          <NotificationDropdown />
          <div className="w-[1px] h-10 bg-white/10 mx-2" />
          <UserProfile user={user} />
        </div>
      </div>
    </div>
  );
}
