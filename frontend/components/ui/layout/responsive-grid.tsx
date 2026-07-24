import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    laptop?: number;
    desktop?: number;
  };
  gap?: "sm" | "md" | "lg";
}

const colsMap: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
  5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
  9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
};

const tabletColsMap: Record<number, string> = {
  1: "tablet:grid-cols-1", 2: "tablet:grid-cols-2", 3: "tablet:grid-cols-3", 4: "tablet:grid-cols-4",
  5: "tablet:grid-cols-5", 6: "tablet:grid-cols-6", 7: "tablet:grid-cols-7", 8: "tablet:grid-cols-8",
  9: "tablet:grid-cols-9", 10: "tablet:grid-cols-10", 11: "tablet:grid-cols-11", 12: "tablet:grid-cols-12",
};

const laptopColsMap: Record<number, string> = {
  1: "laptop:grid-cols-1", 2: "laptop:grid-cols-2", 3: "laptop:grid-cols-3", 4: "laptop:grid-cols-4",
  5: "laptop:grid-cols-5", 6: "laptop:grid-cols-6", 7: "laptop:grid-cols-7", 8: "laptop:grid-cols-8",
  9: "laptop:grid-cols-9", 10: "laptop:grid-cols-10", 11: "laptop:grid-cols-11", 12: "laptop:grid-cols-12",
};

const desktopColsMap: Record<number, string> = {
  1: "desktop:grid-cols-1", 2: "desktop:grid-cols-2", 3: "desktop:grid-cols-3", 4: "desktop:grid-cols-4",
  5: "desktop:grid-cols-5", 6: "desktop:grid-cols-6", 7: "desktop:grid-cols-7", 8: "desktop:grid-cols-8",
  9: "desktop:grid-cols-9", 10: "desktop:grid-cols-10", 11: "desktop:grid-cols-11", 12: "desktop:grid-cols-12",
};

/**
 * ResponsiveGrid provides a flexible CSS grid that adapts column counts automatically
 * across defined breakpoints.
 */
export function ResponsiveGrid({ 
  children, 
  className,
  columns = {
    mobile: 1,
    tablet: 2,
    laptop: 3,
    desktop: 4
  },
  gap = "lg"
}: ResponsiveGridProps) {
  
  const colsClasses = [
    columns.mobile ? colsMap[columns.mobile] : "",
    columns.tablet ? tabletColsMap[columns.tablet] : "",
    columns.laptop ? laptopColsMap[columns.laptop] : "",
    columns.desktop ? desktopColsMap[columns.desktop] : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cn(
      "grid",
      colsClasses,
      LAYOUT.spacing[gap],
      className
    )}>
      {children}
    </div>
  );
}
