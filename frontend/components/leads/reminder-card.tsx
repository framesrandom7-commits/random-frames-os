"use client";

import React, { useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeReminder } from "@/app/actions/lead";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";

type Reminder = {
  id: string;
  date: Date;
  time: string | null;
  type: string;
  completed: boolean;
};

export default function ReminderCard({ reminders }: { reminders: Reminder[] }) {
  const [isPending, startTransition] = useTransition();

  const handleComplete = async (id: string) => {
    startTransition(async () => {
      const success = await completeReminder(id);
      if (success) {
        toast.success("Reminder marked as completed");
      } else {
        toast.error("Failed to complete reminder");
      }
    });
  };

  const pendingReminders = reminders.filter(r => !r.completed);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <span>Reminders</span>
          <Badge count={pendingReminders.length} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reminders.length === 0 ? (
          <p className="text-zinc-500 text-sm">No reminders set.</p>
        ) : (
          <div className="space-y-3">
            {reminders.map(reminder => (
              <div key={reminder.id} className={`flex flex-col gap-2 p-3 rounded-lg border ${reminder.completed ? 'bg-white/5 border-white/5 opacity-70' : 'bg-black/20 border-white/10'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-white text-sm font-medium">
                      {new Date(reminder.date).toLocaleDateString()}
                      {reminder.time && ` at ${reminder.time}`}
                    </span>
                  </div>
                  {!reminder.completed && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs bg-zinc-900 border-white/10 text-white hover:bg-white/10"
                      onClick={() => handleComplete(reminder.id)}
                      disabled={isPending}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Complete
                    </Button>
                  )}
                  {reminder.completed && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
                {reminder.type && <span className="text-xs text-amber-500 capitalize px-6">{reminder.type.replace(/_/g, ' ').toLowerCase()}</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-[#C1121F] text-white text-xs px-2 py-0.5 rounded-full font-medium">
      {count} pending
    </span>
  );
}
