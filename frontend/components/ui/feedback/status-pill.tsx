import React from "react";
import { cn } from "@/lib/utils";

type StatusVariant = "default" | "success" | "warning" | "danger" | "info";

interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusVariant;
  children: React.ReactNode;
}

export function StatusPill({ variant = "default", children, className, ...props }: StatusPillProps) {
  const getVariantStyles = (v: StatusVariant) => {
    switch (v) {
      case "success": return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
      case "warning": return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
      case "danger": return "bg-[#E53935]/10 text-[#E53935] border-[#E53935]/20";
      case "info": return "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20";
      default: return "bg-white/5 text-zinc-300 border-white/10";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-widest border",
        getVariantStyles(variant),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
