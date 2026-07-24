import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * PageContainer is the primary wrapper for all page content below the top bar.
 * It manages responsive padding and centers the content to a max-width.
 */
export function PageContainer({ children, className, contentClassName }: PageContainerProps) {
  return (
    <main className={cn(
      "flex-1 overflow-y-auto custom-scrollbar",
      LAYOUT.padding.page,
      className
    )}>
      <div className={cn(
        "mx-auto w-full",
        LAYOUT.pageMaxWidth,
        contentClassName
      )}>
        {children}
      </div>
    </main>
  );
}
