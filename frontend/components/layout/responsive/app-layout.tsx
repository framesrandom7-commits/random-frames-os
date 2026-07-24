import React from "react";
import { LAYOUT } from "@/lib/layout-constants";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className={cn(
      "flex h-screen w-full bg-[#08090A] text-white selection:bg-[#E53935]/30 overflow-hidden relative items-center justify-center",
      LAYOUT.padding.app,
      className
    )}>
      {/* Global Cinematic Background Canvas */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Subtle noise and grid */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
        
        {/* Deep atmospheric lighting */}
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] bg-red-900/10 rounded-full blur-[140px] mix-blend-screen opacity-40" />
        <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] max-w-[500px] max-h-[500px] bg-[#E53935]/10 rounded-full blur-[100px] mix-blend-screen opacity-30" />
        
        {/* Ambient bottom glow */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen opacity-20" />
      </div>

      {children}
    </div>
  );
}

export function AppLayoutWindow({ children, className }: AppLayoutProps) {
  return (
    <div className={cn(
      "relative z-10 flex h-full w-full mx-auto overflow-hidden bg-[#0F1115]/95 backdrop-blur-3xl border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]",
      LAYOUT.appMaxWidth,
      LAYOUT.radius.app,
      className
    )}>
      {children}
    </div>
  );
}

export function AppLayoutContent({ children, className }: AppLayoutProps) {
  return (
    <div className={cn(
      "flex flex-1 flex-col overflow-hidden relative",
      className
    )}>
      {children}
    </div>
  );
}
