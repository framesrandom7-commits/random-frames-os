"use client";

import React from "react";
import { Search } from "lucide-react";
import { useCommand } from "@/components/providers/command-provider";
import UserProfile from "@/components/dashboard/user-profile";
import { NotificationDropdown } from "@/components/layout/notification-dropdown";

export function TopBar({ user }: { user?: { name: string, roleName: string } }) {
  const { toggle } = useCommand();

  return (
    <div className="sticky top-0 z-40 px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
      <div className="flex h-16 w-full items-center justify-between gap-4 rounded-[20px] bg-[#171A21]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.2)] px-4">
        
        {/* Hero Search Bar */}
        <button
          onClick={toggle}
          className="group flex h-10 flex-1 max-w-2xl items-center gap-3 rounded-xl bg-black/40 px-4 text-sm font-medium text-zinc-400 transition-all hover:bg-black/60 hover:text-white border border-white/5 hover:border-white/10 focus:outline-none"
        >
          <Search className="h-4 w-4 text-zinc-500 group-hover:text-[#E53935] transition-colors" />
          <span className="flex-1 text-left">Search anything in Random Frames OS...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded bg-white/10 px-1.5 font-mono text-[10px] font-medium text-zinc-300">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Global Actions */}
        <div className="flex items-center gap-2 pl-4">
          <NotificationDropdown />
          
          <div className="ml-2 pl-2 border-l border-white/10 flex items-center">
            <UserProfile user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
