"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { NAVIGATION_CONFIG } from "@/lib/navigation-config";

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-white/5 bg-transparent text-white z-20 shrink-0">
      
      {/* Brand Header */}
      <div className="flex h-24 shrink-0 items-center gap-3 px-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-lg border border-white/10 overflow-hidden bg-black shrink-0">
          <Image src="/logo.jpg" alt="Random Frames OS Logo" width={32} height={32} className="object-cover w-full h-full" />
        </div>
        <div className="flex flex-col font-heading justify-center overflow-hidden">
          <span className="text-sm font-bold tracking-widest uppercase text-white truncate">Random Frames</span>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar px-4 pb-4">
        <nav className="flex-1 space-y-1">
          {NAVIGATION_CONFIG.map((item) => {
            const isActive = pathname === item.route || (item.route !== "/" && pathname?.startsWith(item.route));
            
            return (
              <Link
                key={item.id}
                href={item.route}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-heading transition-all duration-200 ease-in-out relative overflow-hidden",
                  isActive
                    ? "text-white bg-white/5 shadow-sm font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 font-medium"
                )}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-[#E53935] rounded-r-full" />
                )}
                
                <item.icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors duration-200",
                    isActive ? "text-[#E53935]" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                  aria-hidden="true"
                />
                <span className="tracking-wide truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
