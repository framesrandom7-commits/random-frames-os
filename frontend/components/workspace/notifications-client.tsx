"use client";

import React, { useTransition } from "react";
import { markAsRead, deleteNotification } from "@/app/actions/notifications";
import { BellRing, CheckCircle, Clock, Trash2 } from "lucide-react";
import { isToday, isYesterday, format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface NotificationsClientProps {
  initialNotifications: any[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markAsRead(id);
      toast.success("Notification marked as read");
    });
  };

  const handleDismiss = (id: string) => {
    startTransition(async () => {
      await deleteNotification(id);
      toast.success("Notification dismissed");
    });
  };

  if (initialNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
        <BellRing className="h-8 w-8 text-zinc-600 mb-3" />
        <h3 className="text-sm font-medium text-zinc-400">All caught up!</h3>
        <p className="text-xs text-zinc-500 mt-1">You don't have any new notifications right now.</p>
      </div>
    );
  }

  const today: any[] = [];
  const yesterday: any[] = [];
  const earlier: any[] = [];

  initialNotifications.forEach((n) => {
    const date = new Date(n.createdAt);
    if (isToday(date)) today.push(n);
    else if (isYesterday(date)) yesterday.push(n);
    else earlier.push(n);
  });

  const getSemanticColor = (priority: string) => {
    if (priority === "URGENT") return "bg-[#E53935]";
    if (priority === "HIGH") return "bg-[#F59E0B]";
    if (priority === "LOW") return "bg-zinc-500";
    return "bg-[#3B82F6]";
  };

  const renderGroup = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</h3>
        <div className="space-y-4">
          {items.map((n) => (
            <div key={n.id} className="group relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${getSemanticColor(n.priority)}`} />
                <div>
                  <h4 className="text-sm font-medium text-white line-clamp-1">{n.title}</h4>
                  {(n.shoot?.project?.title || n.message) && (
                    <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                      {n.shoot?.project?.title ? `Project: ${n.shoot.project.title}` : n.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-medium text-zinc-500">
                  {format(new Date(n.createdAt), title === "Today" ? "h:mm a" : title === "Yesterday" ? "'Yesterday'" : "d MMM")}
                </span>
                
                {/* Actions (visible on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-14 top-1/2 -translate-y-1/2 bg-[#171A21] px-2 py-1 rounded shadow flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleMarkAsRead(n.id)} disabled={isPending} className="h-6 w-6 text-zinc-400 hover:text-white">
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDismiss(n.id)} disabled={isPending} className="h-6 w-6 text-zinc-400 hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderGroup("Today", today)}
      {renderGroup("Yesterday", yesterday)}
      {renderGroup("Earlier", earlier)}
    </div>
  );
}
