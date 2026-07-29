import * as React from "react"
import { cn } from "@/lib/utils"
import { Typography } from "@/components/ui/typography"
import { ModuleWidget } from "./module-widget"

// ModuleSummaryCard (formerly KpiCard)
export interface ModuleSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral" | "warning";
  comparison?: string;
  loading?: boolean;
  empty?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ModuleSummaryCard({
  title,
  value,
  icon,
  trend,
  trendDirection = "neutral",
  comparison,
  loading,
  empty,
  onClick,
  className
}: ModuleSummaryCardProps) {
  
  const trendColorClass = {
    up: "text-emerald-500",
    down: "text-red-500",
    neutral: "text-zinc-500",
    warning: "text-amber-500",
  }[trendDirection];

  // Map trend directions to base colors for the glowing effects
  const glowColors = {
    up: "from-emerald-500/10",
    down: "from-red-500/10",
    neutral: "from-zinc-500/10",
    warning: "from-amber-500/10",
  }[trendDirection];

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col p-5 bg-[#171A21]/60 backdrop-blur-md rounded-[24px] border border-white/5 shadow-lg relative overflow-hidden group transition-all duration-300",
        onClick ? "cursor-pointer hover:shadow-xl hover:-translate-y-1" : "",
        className
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500", onClick ? "group-hover:opacity-100" : "opacity-50", glowColors)} />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-[24px]" />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <Typography variant="label" color="muted">{title}</Typography>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 [&>svg]:h-4 [&>svg]:w-4 text-muted-foreground">
            {icon}
          </div>
        </div>
        
        <div>
          <div className="text-3xl font-bold tracking-tight text-white mb-1">{value}</div>
          {(trend || comparison) && (
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  )
}

// ModuleSummary Container
export interface ModuleSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleSummary({ children, className, ...props }: ModuleSummaryProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)} {...props}>
      {children}
    </div>
  )
}
