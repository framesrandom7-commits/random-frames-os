import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gap?: "sm" | "md" | "lg" | "section";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
}

/**
 * ResponsiveStack is a vertical flex container with standardized spacing.
 */
export function ResponsiveStack({ 
  children, 
  className,
  gap = "md",
  align = "stretch",
  justify = "start",
  ...props
}: ResponsiveStackProps) {
  
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  }[justify];

  return (
    <div 
      className={cn(
        "flex flex-col w-full",
        alignClass,
        justifyClass,
        LAYOUT.spacing[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
