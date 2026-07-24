import React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[16px] bg-white/[0.02] backdrop-blur-sm border border-white/5",
        className
      )}
      {...props}
    >
      <div className="relative z-10 p-4 md:p-6 w-full h-full">
        {children}
      </div>
    </div>
  );
}
