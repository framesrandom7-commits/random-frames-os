"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavigationContextType {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  isMoreSheetOpen: boolean;
  setMoreSheetOpen: (open: boolean) => void;
  isSidebarPinned: boolean;
  setSidebarPinned: (pinned: boolean) => void;
  closeAll: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isMoreSheetOpen, setMoreSheetOpen] = useState(false);
  const [isSidebarPinned, setSidebarPinned] = useState(false);
  const pathname = usePathname();

  // Load pinned state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rf_sidebar_pinned");
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSidebarPinned(JSON.parse(stored));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Sync pinned state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("rf_sidebar_pinned", JSON.stringify(isSidebarPinned));
    } catch (e) {
      // Ignore
    }
  }, [isSidebarPinned]);

  // Close overlays on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDrawerOpen(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMoreSheetOpen(false);
  }, [pathname]);

  const closeAll = () => {
    setDrawerOpen(false);
    setMoreSheetOpen(false);
  };

  return (
    <NavigationContext.Provider
      value={{
        isDrawerOpen,
        setDrawerOpen,
        isMoreSheetOpen,
        setMoreSheetOpen,
        isSidebarPinned,
        setSidebarPinned,
        closeAll,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
