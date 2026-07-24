import React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  withGradient?: boolean;
  hoverEffect?: boolean;
}

export function PremiumCard({
  children,
  className,
  withGradient = false,
  hoverEffect = false,
  ...props
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-[#171A21]/80 backdrop-blur-md border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        hoverEffect && "hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)] hover:-translate-y-[2px] transition-all duration-300 group",
        className
      )}
      {...props}
    >
      {/* Inner highlight ring */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/5" />
      
      {/* Optional gradient background */}
      {withGradient && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
