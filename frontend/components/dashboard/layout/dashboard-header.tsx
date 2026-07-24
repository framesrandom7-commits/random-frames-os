import * as React from "react"
import { cn } from "@/lib/utils"
import { PageTitle, Typography } from "@/components/ui/typography"

export interface DashboardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {breadcrumbs && (
          <div className="mb-2 text-sm text-muted-foreground">
            {breadcrumbs}
          </div>
        )}
        <PageTitle>{title}</PageTitle>
        {subtitle && (
          <Typography variant="body" color="muted">{subtitle}</Typography>
        )}
      </div>

      {(primaryAction || secondaryActions) && (
        <div className="flex flex-row flex-wrap items-center gap-3">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </div>
  )
}
