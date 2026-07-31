"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, MessageSquare, Star, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "system" | "message" | "alert";
  // TODO (Production): Ensure the backend provides the exact route string for ALL modules
  // (e.g. /projects/[id], /leads/[id], /calendar/[id], /communications/[id]).
  // The frontend routing logic below is already built to universally accept any valid URL.
  link: string;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "New Project Brief",
    description: "Client 'Audit Client 2 Pvt Ltd' has uploaded a new brief for the Q3 Campaign.",
    time: "10 mins ago",
    read: false,
    type: "message",
    link: "/projects/cms2z9n43000qh5jrisbxzhkx",
  },
  {
    id: "2",
    title: "Invoice Paid",
    description: "Invoice #INV-AUDIT-1 has been paid by the client.",
    time: "2 hours ago",
    read: false,
    type: "alert",
    link: "/finance/invoices/cms2z9pfq000sh5jr3tmjxpo4",
  },
  {
    id: "3",
    title: "Project Milestone Reached",
    description: "The 'Audit Project 1' has reached the 'Approval' milestone.",
    time: "Yesterday",
    read: true,
    type: "system",
    link: "/projects/cms2z9n43000qh5jrisbxzhkx",
  },
];

export function NotificationDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (id: string, link: string) => {
    markAsRead(id);
    setIsOpen(false);
    router.push(link);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push("/notifications");
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "system": return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "message": return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case "alert": return <Star className="h-4 w-4 text-amber-400" />;
      default: return <Bell className="h-4 w-4 text-zinc-400" />;
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:shadow-sm relative focus:outline-none focus:ring-2 focus:ring-white/20">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E53935] shadow-[0_0_8px_rgba(229,57,53,0.8)]">
            <span className="text-[10px] font-bold text-white leading-none pb-[1px]">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-[#171A21] border-white/10 text-white shadow-2xl p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <span
              onClick={markAllAsRead}
              className="text-xs text-zinc-400 hover:text-white cursor-pointer transition-colors"
            >
              Mark all as read
            </span>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  className={cn(
                    "flex gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                    !notification.read ? "bg-white/[0.02]" : ""
                  )}
                >
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn(
                      "text-sm font-medium leading-none",
                      !notification.read ? "text-white" : "text-zinc-300"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="shrink-0 flex items-center justify-center w-2 h-2 rounded-full bg-[#E53935] self-center" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <Bell className="h-8 w-8 text-zinc-600 mb-3" />
              <p className="text-sm font-medium text-zinc-300">No new notifications</p>
              <p className="text-xs text-zinc-500 mt-1">You're all caught up!</p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-2">
          <button
            onClick={handleViewAll}
            className="w-full text-center text-xs font-medium text-[#E53935] hover:bg-[#E53935]/10 rounded-md py-2 transition-colors focus:outline-none"
          >
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
