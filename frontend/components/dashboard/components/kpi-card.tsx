import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Widget } from "../layout/widget"
import { Typography } from "@/components/ui/typography"
import { cn } from "@/lib/utils"

export interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral" | "warning";
  comparison?: string;
  loading?: boolean;
  empty?: boolean;
  onClick?: () => void;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection = "neutral",
  comparison,
  loading,
  empty,
  onClick,
  className
}: KpiCardProps) {
  
  // Trend colours could be mapped to design tokens, assuming success/destructive classes exist
  const trendColorClass = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-zinc-500",
    warning: "text-amber-500",
  }[trendDirection];

  return (
    <Widget
      loading={loading}
      empty={empty}
      className={cn(onClick && "cursor-pointer hover:border-white/20 transition-colors", className)}
      contentClassName="p-6 flex flex-col gap-4"
      onClick={onClick}
    >
      <div className="flex flex-row items-center justify-between">
        <Typography variant="label" color="muted">{title}</Typography>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {(trend || comparison) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <Typography variant="caption" className={trendColorClass}>
                {trend}
              </Typography>
            )}
            {comparison && (
              <Typography variant="caption" color="muted">
                {comparison}
              </Typography>
            )}
          </div>
        )}
      </div>
    </Widget>
  )
}
