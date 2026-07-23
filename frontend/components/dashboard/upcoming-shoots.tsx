import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { getShoots } from "@/app/actions/shoot";
import Link from "next/link";

export default async function UpcomingShoots() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { shoots: allUpcoming } = await getShoots({ 
    limit: 10, 
    dateStart: today,
    sortBy: "date",
    sortOrder: "asc",
  });

  const validShoots = allUpcoming.filter(s => s.status !== "CANCELLED" && s.status !== "POSTPONED").slice(0, 5);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-white">Upcoming Shoots</CardTitle>
        <Link href="/shoots?view=calendar" className="text-sm text-zinc-400 hover:text-white transition-colors">View Calendar</Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {validShoots.length === 0 ? (
          <div className="text-center py-4 text-zinc-500 text-sm">
            No upcoming shoots scheduled.
          </div>
        ) : (
          validShoots.map((shoot) => (
            <Link key={shoot.id} href={`/shoots/${shoot.id}`} className="block">
              <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-zinc-900/50 p-3 transition-colors hover:bg-white/5 hover:border-white/20">
                <h4 className="font-medium text-zinc-200">{shoot.title}</h4>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {shoot.date ? new Date(shoot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : "TBD"}
                  </div>
                  {shoot.location && (
                    <div className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{shoot.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
