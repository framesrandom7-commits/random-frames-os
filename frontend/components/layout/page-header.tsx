"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { PageTitle, PageSubtitle } from "@/components/ui/typography";

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action, children, className, ...props }: PageHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.getElementById("topbar-title-portal"));
  }, []);

  const content = (
    <div className={cn("flex flex-1 items-center gap-6 min-w-0", className)} {...props}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-3">
          <PageTitle className="truncate">{title}</PageTitle>
          {subtitle && <PageSubtitle className="truncate mt-1">{subtitle}</PageSubtitle>}
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {children}
        {action}
      </div>
    </div>
  );

  if (mounted && portalTarget) {
    return createPortal(content, portalTarget);
  }

  return null;
}
