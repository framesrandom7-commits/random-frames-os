import React from "react";
import { prisma } from "@/lib/prisma";
import { Activity, Clock, Calendar, UploadCloud, CheckCircle, MessageSquare, FileText, User } from "lucide-react";
import { formatDistanceToNow, isYesterday } from "date-fns";

// Map activity types to relevant icons and colors
const getActivityVisuals = (description: string) => {
  const lower = description.toLowerCase();
  if (lower.includes("calendar") || lower.includes("shoot")) return { icon: Calendar, color: "text-[#E53935]", bg: "bg-[#E53935]/10", border: "border-[#E53935]/20" };
  if (lower.includes("upload") || lower.includes("file")) return { icon: UploadCloud, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20" };
  if (lower.includes("complete") || lower.includes("review")) return { icon: CheckCircle, color: "text-[#10B981]", bg: "bg-[#10B981]/10", border: "border-[#10B981]/20" };
  if (lower.includes("comment") || lower.includes("message")) return { icon: MessageSquare, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/20" };
  if (lower.includes("deliverable") || lower.includes("document")) return { icon: FileText, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", border: "border-[#3B82F6]/20" };
  if (lower.includes("lead") || lower.includes("client")) return { icon: User, color: "text-zinc-400", bg: "bg-zinc-400/10", border: "border-zinc-400/20" };
  return { icon: Activity, color: "text-zinc-500", bg: "bg-zinc-500/10", border: "border-zinc-500/20" };
};

export default async function RecentActivityWidget() {
  const activities = await prisma.activity.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Activity</h2>
      
      <div className="bg-[#171A21]/50 p-6 rounded-[24px] border border-white/5 relative overflow-hidden">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <Activity className="w-6 h-6 text-zinc-600 mb-2" />
            <p className="text-zinc-400 font-medium text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Horizontal Connector Line */}
            <div className="absolute top-5 left-8 right-8 h-[1px] bg-white/10 hidden md:block" />

            <div className="flex flex-col md:flex-row gap-6 md:gap-4 overflow-x-auto custom-scrollbar pb-2">
              {activities.map((activity, i) => {
                let timeStr = "";
                if (isYesterday(new Date(activity.createdAt))) {
                  timeStr = "Yesterday";
                } else {
                  timeStr = formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true });
                  timeStr = timeStr.replace('about ', '');
                }

                const { icon: Icon, color, bg, border } = getActivityVisuals(activity.description);

                return (
                  <div key={activity.id} className="relative flex md:flex-col items-start gap-4 md:gap-3 flex-1 min-w-[200px] group">
                    {/* Circle Icon */}
                    <div className={`relative z-10 shrink-0 w-10 h-10 rounded-full ${bg} ${border} border flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex flex-col gap-1 mt-1 md:mt-0">
                      <span className="text-xs font-semibold text-white leading-tight">
                        {activity.description}
                      </span>
                      <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                        {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
