"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Pin, PinOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_CONFIG } from "@/lib/navigation-config";
import { useNavigation } from "./navigation-context";

export function CompactSidebar({ user }: { user?: { name: string, roleName: string } }) {
  const pathname = usePathname();
  const { isSidebarPinned, setSidebarPinned } = useNavigation();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = isSidebarPinned || isHovered;

  return (
    <div 
      className={cn(
        "flex h-full flex-col border-r border-white/5 bg-[#0F1115]/95 text-white z-30 shrink-0 transition-all duration-300 ease-in-out absolute laptop:relative",
        isExpanded ? "w-[260px] shadow-2xl" : "w-[80px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Header */}
      <div className={cn(
        "flex h-24 shrink-0 items-center gap-3.5 transition-all duration-300",
        isExpanded ? "px-8" : "px-0 justify-center"
      )}>
        <div className="flex h-[65px] w-[65px] items-center justify-center rounded-xl shadow-lg border border-white/10 overflow-hidden bg-black shrink-0">
          <Image src="/logo.jpg" alt="Random Frames OS Logo" width={65} height={65} className="object-cover w-full h-full" />
        </div>
        <div className={cn(
          "flex flex-col font-heading justify-center overflow-hidden transition-all duration-300 leading-[1.05] pt-0.5",
          isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"
        )}>
          <span className="text-[18px] font-black tracking-[0.15em] uppercase text-white">Random</span>
          <span className="text-[18px] font-black uppercase text-white flex justify-between pr-[0.15em]">
            <span>F</span><span>R</span><span>A</span><span>M</span><span>E</span><span>S</span>
          </span>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex flex-1 flex-col overflow-y-auto custom-scrollbar pb-4 transition-all duration-300">
        <nav className="flex-1 space-y-2 px-3">
          {NAVIGATION_CONFIG.filter(item => !item.allowedRoles || item.allowedRoles.includes(user?.roleName || "Founder")).map((item) => {
            const isActive = pathname === item.route || (item.route !== "/" && pathname?.startsWith(item.route));
            
            return (
              <Link
                key={item.id}
                href={item.route}
                className={cn(
                  "group flex items-center rounded-xl py-3 font-heading transition-all duration-200 ease-in-out relative overflow-hidden",
                  isExpanded ? "px-4 gap-3" : "px-0 justify-center",
                  isActive
                    ? "text-white bg-white/5 shadow-sm font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 font-medium"
                )}
                title={!isExpanded ? item.label : undefined}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 bg-[#E53935]",
                    isExpanded ? "left-0 w-1 h-1/2 rounded-r-full" : "left-1 w-1 h-1/2 rounded-full"
                  )} />
                )}
                
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    isActive ? "text-[#E53935]" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                  aria-hidden="true"
                />
                
                <span className={cn(
                  "tracking-wide truncate transition-all duration-300",
                  isExpanded ? "w-auto opacity-100" : "w-0 opacity-0 hidden"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Pin Toggle */}
      <div className={cn(
        "p-4 border-t border-white/5 transition-all duration-300 flex items-center",
        isExpanded ? "justify-between" : "justify-center"
      )}>
        <button
          onClick={() => setSidebarPinned(!isSidebarPinned)}
          className={cn(
            "p-2 rounded-lg transition-colors duration-200",
            isSidebarPinned ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"
          )}
          title={isSidebarPinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          {isSidebarPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
