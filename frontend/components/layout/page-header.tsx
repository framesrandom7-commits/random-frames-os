import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

import { PageTitle, PageSubtitle } from "@/components/ui/typography";

export function PageHeader({ title, subtitle, action, children, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center justify-between pb-8", className)} {...props}>
      <div className="flex flex-col gap-1">
        <PageTitle>{title}</PageTitle>
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </div>
      
      <div className="flex items-center gap-3">
        {children}
        {action}
      </div>
    </div>
  );
}
