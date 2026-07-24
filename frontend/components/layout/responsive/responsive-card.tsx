import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "none" | "card" | "page";
  variant?: "default" | "glass" | "outline";
}

/**
 * ResponsiveCard provides a standardized container with responsive padding and
 * a consistent design language.
 */
export function ResponsiveCard({ 
  children, 
  className,
  padding = "card",
  variant = "default",
  ...props
}: ResponsiveCardProps) {
  
  const paddingClass = padding === "none" ? "" : LAYOUT.padding[padding];
  
  const variantClass = {
    default: "bg-[#1D212B] border border-white/[0.05] shadow-lg",
    glass: "bg-[#1D212B]/60 backdrop-blur-md border border-white/[0.08] shadow-xl",
    outline: "bg-transparent border border-white/[0.1]",
  }[variant];

  return (
    <div 
      className={cn(
        "flex flex-col w-full overflow-hidden",
        LAYOUT.radius.lg,
        paddingClass,
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
