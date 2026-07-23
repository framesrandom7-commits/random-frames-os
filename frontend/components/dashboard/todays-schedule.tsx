import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, Video } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function TodaysSchedule() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const events = await prisma.calendarEvent.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      }
    },
    orderBy: { startTime: "asc" }
  });

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" /> Today's Schedule
        </CardTitle>
        <Link href="/calendar" className="text-xs text-zinc-400 hover:text-white transition-colors">View All</Link>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-zinc-500 text-sm">Nothing scheduled for today.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 rounded-md bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="mt-0.5 rounded-full p-2 bg-blue-500/20 text-blue-400">
                  {event.eventType === "SHOOT" ? <Video className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-zinc-200 truncate">{event.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase h-5 px-1.5 border-blue-500/20 bg-blue-500/10 text-blue-400">
                      {event.eventType}
                    </Badge>
                    {(event.startTime || event.endTime) && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.startTime || "?"} - {event.endTime || "?"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
