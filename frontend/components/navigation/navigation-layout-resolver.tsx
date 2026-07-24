"use client";

import React from "react";
import { useDeviceType } from "@/hooks/use-breakpoints";
import { DesktopSidebar } from "./desktop-sidebar";
import { CompactSidebar } from "./compact-sidebar";
import { MobileDrawer } from "./mobile-drawer";
import { BottomNavigation } from "./bottom-navigation";
import { MobileMoreSheet } from "./mobile-more-sheet";
import { NavigationProvider } from "./navigation-context";

export function NavigationLayoutResolver() {
  const deviceType = useDeviceType();

  // If unknown (during SSR), render nothing or a skeleton to prevent layout shift.
  // We can render DesktopSidebar as default during SSR or just wait.
  // A safe approach for SSR is to render the Desktop Sidebar hidden, but we'll 
  // just return null or the Desktop sidebar for now.
  if (deviceType === "unknown") {
    return <DesktopSidebar />; 
  }

  if (deviceType === "desktop") {
    return <DesktopSidebar />;
  }

  if (deviceType === "laptop") {
    return <CompactSidebar />;
  }

  if (deviceType === "tablet") {
    return <MobileDrawer />;
  }

  if (deviceType === "mobile") {
    return (
      <>
        <BottomNavigation />
        <MobileMoreSheet />
      </>
    );
  }

  return <DesktopSidebar />;
}

export function AdaptiveNavigation() {
  return (
    <NavigationProvider>
      <NavigationLayoutResolver />
    </NavigationProvider>
  );
}
