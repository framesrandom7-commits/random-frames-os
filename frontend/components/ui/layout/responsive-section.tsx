import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function ResponsiveSection({ children, className, title, action }: ResponsiveSectionProps) {
  return (
    <section className={cn(
      "flex flex-col w-full",
      LAYOUT.spacing.lg,
      LAYOUT.padding.section,
      className
    )}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {title && (
            <h2 className="text-xl tablet:text-2xl font-bold tracking-tight text-white">{title}</h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
