import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

export default function UpcomingShoots() {
  const shoots = [
    { id: 1, title: "Corporate Headshots", date: "Tomorrow, 10:00 AM", location: "Downtown Studio" },
    { id: 2, title: "Product Launch Video", date: "Fri, 2:00 PM", location: "Tech Park" },
  ];

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Upcoming Shoots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shoots.map((shoot) => (
          <div key={shoot.id} className="flex flex-col gap-2 rounded-lg border border-white/10 bg-zinc-900/50 p-3 transition-colors hover:bg-white/5 hover:border-white/20">
            <h4 className="font-medium text-zinc-200">{shoot.title}</h4>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {shoot.date}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {shoot.location}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
