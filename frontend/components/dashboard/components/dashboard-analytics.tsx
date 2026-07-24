import * as React from "react"
import { cn } from "@/lib/utils"

export interface DashboardAnalyticsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DashboardAnalytics({ children, className, ...props }: DashboardAnalyticsProps) {
  return (
    <div 
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-6",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
