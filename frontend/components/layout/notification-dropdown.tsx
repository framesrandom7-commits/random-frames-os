"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationDropdown() {
  // Hardcoded for now based on V1 requirements:
  const notificationsCount = 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:shadow-sm relative focus:outline-none focus:ring-2 focus:ring-white/20">
        <Bell className="h-4 w-4" />
        {notificationsCount > 0 && (
          <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#E53935] shadow-[0_0_8px_rgba(229,57,53,0.8)]">
            <span className="text-[7px] font-bold text-white">{notificationsCount > 9 ? '9+' : notificationsCount}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-[#171A21] border-white/10 text-white shadow-2xl p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <span className="text-xs text-zinc-500 cursor-pointer hover:text-white transition-colors">Mark all as read</span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {/* Empty State for now */}
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Bell className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm font-medium text-zinc-300">No new notifications</p>
            <p className="text-xs text-zinc-500 mt-1">You're all caught up!</p>
          </div>
        </div>
        
        <div className="border-t border-white/10 p-2">
          <button className="w-full text-center text-xs font-medium text-[#E53935] hover:bg-[#E53935]/10 rounded-md py-2 transition-colors focus:outline-none">
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
