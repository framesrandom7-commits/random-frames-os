import { Activity } from "@prisma/client";
import { format } from "date-fns";
import { Activity as ActivityIcon, CheckCircle2, FileText, Settings, Upload } from "lucide-react";

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-zinc-900/50 rounded-xl border border-white/10">
        <ActivityIcon className="w-8 h-8 text-white/20 mb-3" />
        <p className="text-sm text-white/50">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const isLast = index === activities.length - 1;
        
        let Icon = ActivityIcon;
        let colorClass = "text-blue-500 bg-blue-500/10";
        
        if (activity.type === "STATUS_CHANGE") {
          Icon = CheckCircle2;
          colorClass = "text-emerald-500 bg-emerald-500/10";
        } else if (activity.type === "FILE_UPLOAD") {
          Icon = Upload;
          colorClass = "text-purple-500 bg-purple-500/10";
        } else if (activity.type === "NOTE") {
          Icon = FileText;
          colorClass = "text-amber-500 bg-amber-500/10";
        } else if (activity.type === "SYSTEM") {
          Icon = Settings;
          colorClass = "text-white/60 bg-white/10";
        }
        
        return (
          <div key={activity.id} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute top-8 bottom-[-1rem] left-5 w-px bg-white/10" />
            )}
            
            <div className={`relative flex-none w-10 h-10 rounded-full flex items-center justify-center border border-white/5 ${colorClass} z-10`}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <p className="text-sm text-white/90 font-medium">
                  {activity.description}
                </p>
                <time className="text-xs text-white/40 whitespace-nowrap">
                  {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </time>
              </div>
              
              {activity.metadata && (
                <div className="mt-2 bg-black/40 rounded-lg p-3 border border-white/5 overflow-x-auto">
                  <pre className="text-xs text-white/60 font-mono">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
