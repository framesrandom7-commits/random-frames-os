"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_CONFIG } from "@/lib/navigation-config";
import { useNavigation } from "./navigation-context";

export function MobileDrawer() {
  const pathname = usePathname();
  const { isDrawerOpen, setDrawerOpen } = useNavigation();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setDrawerOpen]);

  // Trap focus (simple version: just focus the first element on open)
  useEffect(() => {
    if (isDrawerOpen && drawerRef.current) {
      const firstFocusable = drawerRef.current.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isDrawerOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#0F1115] border-r border-white/10 shadow-2xl transition-transform duration-300 ease-out",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-lg border border-white/10 overflow-hidden bg-black shrink-0">
              <Image src="/logo.jpg" alt="Random Frames OS Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase text-white truncate">Menu</span>
          </div>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          <nav className="flex flex-col gap-1">
            {NAVIGATION_CONFIG.map((item) => {
              const isActive = pathname === item.route || (item.route !== "/" && pathname?.startsWith(item.route));
              return (
                <Link
                  key={item.id}
                  href={item.route}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3.5 text-[15px] font-heading transition-all duration-200",
                    isActive
                      ? "text-white bg-white/10 font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5 font-medium"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-[#E53935]" : "text-zinc-500"
                    )}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
