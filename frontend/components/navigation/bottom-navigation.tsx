"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOTTOM_NAV_ITEMS } from "@/lib/navigation-config";
import { useNavigation } from "./navigation-context";

export function BottomNavigation() {
  const pathname = usePathname();
  const { setMoreSheetOpen } = useNavigation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1115]/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-16 px-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route || (item.route !== "/" && pathname?.startsWith(item.route));
          
          return (
            <Link
              key={item.id}
              href={item.route}
              className="flex flex-col items-center justify-center w-full h-full gap-1 group"
            >
              <div className={cn(
                "p-1.5 rounded-full transition-colors",
                isActive ? "bg-[#E53935]/20 text-[#E53935]" : "text-zinc-400 group-hover:text-white group-hover:bg-white/5"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                isActive ? "text-[#E53935]" : "text-zinc-500 group-hover:text-zinc-300"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setMoreSheetOpen(true)}
          className="flex flex-col items-center justify-center w-full h-full gap-1 group focus:outline-none"
        >
          <div className="p-1.5 rounded-full transition-colors text-zinc-400 group-hover:text-white group-hover:bg-white/5">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium transition-colors text-zinc-500 group-hover:text-zinc-300">
            More
          </span>
        </button>
      </nav>
    </div>
  );
}
