"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getNotifications, markAsRead, markAllAsRead } from "@/app/actions/notifications";
import Link from "next/link";

export default function NotificationButton() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const data = await getNotifications({ status: 'PENDING' });
    setNotifications(data);
    setUnreadCount(data.length);
  };

  useEffect(() => {
    fetchNotifications();
    // Optional polling could go here
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  return (
    <Popover onOpenChange={(open) => { if(open) fetchNotifications(); }}>
      <PopoverTrigger className="relative text-zinc-400 hover:bg-white/10 hover:text-white rounded-full p-2 inline-flex items-center justify-center">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#C1121F] border border-black"></span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-zinc-900 border-white/10 text-white shadow-2xl" align="end" alignOffset={-10}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-auto p-0 text-xs text-zinc-400 hover:text-white hover:bg-transparent">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.slice(0, 5).map(n => (
                <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 flex gap-3 group relative">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{n.title}</p>
                    {n.message && <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-zinc-500 mt-2 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {n.dueDate ? new Date(n.dueDate).toLocaleDateString() : 'No due date'}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => handleMarkAsRead(n.id, e)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-emerald-400 shrink-0"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t border-white/10 text-center bg-black/20">
          <Link href="/notifications" className="text-xs font-medium text-[#C1121F] hover:text-[#a00f1a] w-full block py-1">
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
