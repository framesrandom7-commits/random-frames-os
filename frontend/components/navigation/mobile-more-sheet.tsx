"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVIGATION_CONFIG } from "@/lib/navigation-config";
import { useNavigation } from "./navigation-context";

export function MobileMoreSheet() {
  const pathname = usePathname();
  const { isMoreSheetOpen, setMoreSheetOpen } = useNavigation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMoreSheetOpen) {
        setMoreSheetOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreSheetOpen, setMoreSheetOpen]);

  // Touch handling for swipe down to dismiss
  const touchStartY = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) { // Only allow dragging downwards
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      setMoreSheetOpen(false);
    }
    setDragY(0);
  };

  const remainingItems = NAVIGATION_CONFIG.filter(item => item.showOnMobile && !item.showInBottomNav);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isMoreSheetOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMoreSheetOpen(false)}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div 
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="More Options"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[#1D212B] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out pb-[env(safe-area-inset-bottom)]",
          isMoreSheetOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          transform: isMoreSheetOpen ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: dragY > 0 ? 'none' : 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)'
        }}
      >
        {/* Drag Handle Area */}
        <div 
          className="w-full pt-3 pb-4 flex justify-center items-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 max-h-[70vh]">
          
          <div className="mb-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Modules</h3>
            <div className="space-y-1 bg-white/5 rounded-2xl p-2 border border-white/5">
              {remainingItems.map((item) => {
                const isActive = pathname === item.route || (item.route !== "/" && pathname?.startsWith(item.route));
                return (
                  <Link
                    key={item.id}
                    href={item.route}
                    onClick={() => setMoreSheetOpen(false)}
                    className={cn(
                      "flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-heading transition-all",
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
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Account</h3>
            <div className="space-y-1 bg-white/5 rounded-2xl p-2 border border-white/5">
              <Link
                href="/settings/profile"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-heading text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <User className="h-5 w-5 text-zinc-500" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-heading text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="h-5 w-5 text-zinc-500" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="w-full flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-heading text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut className="h-5 w-5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
