import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "row" | "row-reverse" | "col" | "col-reverse";
  mobileDirection?: "row" | "row-reverse" | "col" | "col-reverse";
  gap?: "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean;
}

/**
 * ResponsiveFlex provides a flexible flexbox container that can change direction
 * on mobile devices automatically.
 */
export function ResponsiveFlex({ 
  children, 
  className,
  direction = "row",
  mobileDirection = "col",
  gap = "md",
  align = "center",
  justify = "start",
  wrap = false,
  ...props
}: ResponsiveFlexProps) {
  
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  }[align];

  const justifyClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify];
  
  const directionClass = {
    "row": "flex-row",
    "row-reverse": "flex-row-reverse",
    "col": "flex-col",
    "col-reverse": "flex-col-reverse",
  }[direction];

  const mobileDirectionClass = {
    "row": "max-tablet:flex-row",
    "row-reverse": "max-tablet:flex-row-reverse",
    "col": "max-tablet:flex-col",
    "col-reverse": "max-tablet:flex-col-reverse",
  }[mobileDirection];

  return (
    <div 
      className={cn(
        "flex",
        directionClass,
        mobileDirectionClass,
        alignClass,
        justifyClass,
        wrap ? "flex-wrap" : "flex-nowrap",
        LAYOUT.spacing[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
