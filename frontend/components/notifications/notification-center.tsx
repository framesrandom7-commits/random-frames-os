"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getNotifications, syncAutomatedNotifications } from "@/app/actions/notifications";
import NotificationCard from "./notification-card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import AddReminderModal from "./add-reminder-modal";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    // Ensure all automated logic runs before fetching
    await syncAutomatedNotifications();
    const data = await getNotifications();
    setNotifications(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const nextWeekStart = new Date(todayStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  // Categorize
  const pending = notifications.filter(n => n.status === 'PENDING' || n.status === 'SNOOZED');
  
  const today = pending.filter(n => {
    if(!n.dueDate) return false;
    const due = new Date(n.dueDate);
    return due < tomorrowStart; // Overdue or due today
  });

  const upcomingThisWeek = pending.filter(n => {
    if(!n.dueDate) return true; // No due date goes to upcoming
    const due = new Date(n.dueDate);
    return due >= tomorrowStart && due < nextWeekStart;
  });

  const upcomingLater = pending.filter(n => {
    if(!n.dueDate) return false;
    const due = new Date(n.dueDate);
    return due >= nextWeekStart;
  });

  const completed = notifications.filter(n => n.status === 'COMPLETED');
  const dismissed = notifications.filter(n => n.status === 'DISMISSED');

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-12 text-zinc-500 border border-dashed border-white/10 rounded-lg">
      <p>{message}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-white">Notification Center</h2>
          <p className="text-zinc-400 mt-1">Manage your reminders, alerts, and upcoming deadlines.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Reminder
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-md">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="bg-black/40 border border-white/10 mb-6 flex-wrap h-auto">
            <TabsTrigger value="today" className="data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Today ({today.length})
            </TabsTrigger>
            <TabsTrigger value="week" className="data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              This Week ({upcomingThisWeek.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Upcoming ({upcomingLater.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              History
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#C1121F]" />
            </div>
          ) : (
            <>
              <TabsContent value="today" className="space-y-4 m-0">
                {today.length === 0 ? <EmptyState message="You have no tasks due today. Enjoy your day!" /> : 
                  today.map(n => <NotificationCard key={n.id} notification={n} onUpdate={fetchNotifications} />)
                }
              </TabsContent>
              
              <TabsContent value="week" className="space-y-4 m-0">
                {upcomingThisWeek.length === 0 ? <EmptyState message="No reminders scheduled for this week." /> : 
                  upcomingThisWeek.map(n => <NotificationCard key={n.id} notification={n} onUpdate={fetchNotifications} />)
                }
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4 m-0">
                {upcomingLater.length === 0 ? <EmptyState message="No distant reminders found." /> : 
                  upcomingLater.map(n => <NotificationCard key={n.id} notification={n} onUpdate={fetchNotifications} />)
                }
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 m-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-medium mb-3">Recently Completed</h3>
                    {completed.length === 0 ? <p className="text-zinc-500 text-sm">No completed items.</p> :
                      <div className="space-y-3">
                        {completed.slice(0,10).map(n => <NotificationCard key={n.id} notification={n} onUpdate={fetchNotifications} />)}
                      </div>
                    }
                  </div>
                  <div>
                    <h3 className="text-zinc-400 font-medium mb-3">Dismissed Alerts</h3>
                    {dismissed.length === 0 ? <p className="text-zinc-500 text-sm">No dismissed items.</p> :
                      <div className="space-y-3 opacity-70">
                        {dismissed.slice(0,5).map(n => <NotificationCard key={n.id} notification={n} onUpdate={fetchNotifications} />)}
                      </div>
                    }
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <AddReminderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchNotifications} 
      />
    </div>
  );
}
