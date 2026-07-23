

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing } from "lucide-react";

export default function NotificationsWidget() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">Notifications</h2>
      <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">
            <BellRing className="h-6 w-6 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-white">All caught up!</h3>
            <p className="text-sm text-zinc-400">You don't have any new notifications right now.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
