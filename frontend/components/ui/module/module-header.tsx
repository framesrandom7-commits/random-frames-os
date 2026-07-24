import * as React from "react"
import { cn } from "@/lib/utils"
import { PageTitle, Typography } from "@/components/ui/typography"

export interface ModuleHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  breadcrumbs?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode;
}

export function ModuleHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  className,
  ...props
}: ModuleHeaderProps) {
  return (
    <div 
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:justify-between px-4 md:px-6 lg:px-8 py-6 border-b border-white/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        {breadcrumbs && (
          <div className="mb-2 text-sm text-muted-foreground truncate">
            {breadcrumbs}
          </div>
        )}
        <PageTitle className="truncate">{title}</PageTitle>
        {subtitle && (
          <Typography variant="body" color="muted" className="truncate">
            {subtitle}
          </Typography>
        )}
      </div>

      {(primaryAction || secondaryActions) && (
        <div className="flex flex-row flex-wrap items-center gap-3 shrink-0">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </div>
  )
}
