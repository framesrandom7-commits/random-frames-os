"use client";

import * as React from "react"
import { createPortal } from "react-dom"
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
  const [mounted, setMounted] = React.useState(false);
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    setPortalTarget(document.getElementById("topbar-title-portal"));
  }, []);

  const content = (
    <div 
      className={cn(
        "flex flex-1 items-center gap-6 min-w-0",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        {breadcrumbs && (
          <div className="text-xs text-muted-foreground truncate">
            {breadcrumbs}
          </div>
        )}
        <div className="flex items-center gap-3">
          <PageTitle className="pb-2">{title}</PageTitle>
          {subtitle && (
            <Typography variant="body" color="muted" className="truncate mt-1">
              {subtitle}
            </Typography>
          )}
        </div>
      </div>

      {(primaryAction || secondaryActions) && (
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </div>
  );

  if (mounted && portalTarget) {
    return createPortal(content, portalTarget);
  }

  return null;
}
