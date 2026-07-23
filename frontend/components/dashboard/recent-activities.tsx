import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { Activity, Clock } from "lucide-react";

export default async function RecentActivities() {
  const activities = await prisma.activity.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-zinc-500 text-sm">No recent activities.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-3 pl-4 space-y-6 mt-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative">
                <span className="absolute -left-[21px] flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[#C1121F] ring-[4px] ring-[#050505]" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-zinc-200">{activity.description}</span>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
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
