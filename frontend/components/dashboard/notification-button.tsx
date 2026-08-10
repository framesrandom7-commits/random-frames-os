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
    // eslint-disable-next-line
    fetchNotifications();
    // Optional polling could go here
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await markAsRead(id);
    } catch (error) {
      // Revert on failure (or simply re-fetch)
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic UI update
    setNotifications([]);
    setUnreadCount(0);
    
    try {
      await markAllAsRead();
    } catch (error) {
      fetchNotifications();
    }
  };

  const getNotificationLink = (n: any) => {
    if (n.invoiceId) return `/finance/invoices/${n.invoiceId}`;
    if (n.shootId) return `/shoots/${n.shootId}`;
    if (n.projectId) return `/projects/${n.projectId}`;
    if (n.clientId) return `/clients/${n.clientId}`;
    if (n.leadId) return `/leads/${n.leadId}`;
    return `/notifications`;
  };

  return (
    <Popover onOpenChange={(open) => { if(open) fetchNotifications(); }}>
      <PopoverTrigger className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-white/10 hover:text-white hover:shadow-sm relative outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-none">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E53935] shadow-[0_0_8px_rgba(229,57,53,0.8)]">
            <span className="text-[10px] font-bold text-white leading-none pb-[1px]">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
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
                <Link key={n.id} href={getNotificationLink(n)} className="p-4 border-b border-white/5 hover:bg-white/5 flex gap-3 group relative cursor-pointer block">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#E53935] transition-colors">{n.title}</p>
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
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-emerald-400 shrink-0 z-10 relative"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </Link>
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
