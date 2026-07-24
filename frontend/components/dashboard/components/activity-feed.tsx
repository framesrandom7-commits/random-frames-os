import * as React from "react"
import { LucideIcon, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { Widget } from "../layout/widget"
import { Typography } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

export type ActivityItemStatus = "success" | "pending" | "error" | "warning" | "neutral";

export interface ActivityFeedItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp?: string | Date;
  icon?: LucideIcon;
  status?: ActivityItemStatus;
  href?: string; // Optional link
}

export interface ActivityFeedProps {
  title: string;
  subtitle?: string;
  items: ActivityFeedItem[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  actions?: React.ReactNode;
}

const statusColorMap: Record<ActivityItemStatus, string> = {
  success: "text-emerald-500",
  pending: "text-blue-500",
  error: "text-red-500",
  warning: "text-amber-500",
  neutral: "text-muted-foreground",
}

const statusBgMap: Record<ActivityItemStatus, string> = {
  success: "bg-emerald-500/10",
  pending: "bg-blue-500/10",
  error: "bg-red-500/10",
  warning: "bg-amber-500/10",
  neutral: "bg-white/5",
}

const DefaultStatusIcon: Record<ActivityItemStatus, LucideIcon> = {
  success: CheckCircle2,
  pending: Clock,
  error: XCircle,
  warning: AlertCircle,
  neutral: Clock,
}

export function ActivityFeed({
  title,
  subtitle,
  items,
  loading,
  emptyMessage = "No recent activity",
  className,
  actions
}: ActivityFeedProps) {

  return (
    <Widget
      title={title}
      subtitle={subtitle}
      actions={actions}
      loading={loading}
      empty={items.length === 0}
      emptyMessage={emptyMessage}
      className={className}
      contentClassName="p-0"
    >
      <div className="flex flex-col">
        {items.map((item, index) => {
          const status = item.status || "neutral";
          const Icon = item.icon || DefaultStatusIcon[status];
          const isLast = index === items.length - 1;

          const content = (
            <div className="relative flex gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
              {!isLast && (
                <div className="absolute left-9 top-10 bottom-0 w-px bg-white/10" />
              )}
              <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5", statusBgMap[status])}>
                <Icon className={cn("h-4 w-4", statusColorMap[status])} />
              </div>
              <div className="flex flex-col flex-1 gap-1 min-w-0 py-1">
                <div className="flex justify-between items-start gap-4">
                  <Typography variant="body" className="font-medium truncate">{item.title}</Typography>
                  {item.timestamp && (
                    <Typography variant="caption" color="muted" className="shrink-0 whitespace-nowrap mt-0.5">
                      {item.timestamp instanceof Date 
                        ? item.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        : item.timestamp}
                    </Typography>
                  )}
                </div>
                {item.description && (
                  <Typography variant="caption" color="muted" className="line-clamp-2">
                    {item.description}
                  </Typography>
                )}
              </div>
            </div>
          );

          if (item.href) {
            return (
              <a key={item.id} href={item.href} className="block outline-none">
                {content}
              </a>
            )
          }

          return <div key={item.id}>{content}</div>
        })}
      </div>
    </Widget>
  )
}
