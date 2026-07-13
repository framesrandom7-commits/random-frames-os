"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotifications, markAsRead } from "@/app/actions/notifications";
import { Clock, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function UpcomingReminders() {
  const [reminders, setReminders] = useState<any[]>([]);

  const fetchReminders = async () => {
    const data = await getNotifications({ status: 'PENDING' });
    setReminders(data.slice(0, 5)); // Show top 5
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleComplete = async (id: string) => {
    await markAsRead(id);
    fetchReminders();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-md">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Action Required
          </CardTitle>
          <Badge variant="outline" className="bg-white/5 text-zinc-400">{reminders.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {reminders.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            You're all caught up!
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {reminders.map((r) => (
              <div key={r.id} className="p-4 hover:bg-white/5 transition-colors flex items-start justify-between gap-4 group">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-[10px] uppercase h-5 px-1.5 ${getPriorityColor(r.priority)}`}>
                      {r.priority}
                    </Badge>
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                  </div>
                  {r.message && <p className="text-xs text-zinc-400 truncate">{r.message}</p>}
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleComplete(r.id)}
                  className="h-8 w-8 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mark Complete"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
