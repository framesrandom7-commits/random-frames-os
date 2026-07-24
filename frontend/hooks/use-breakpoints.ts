"use client";

import { useMediaQuery } from "./use-media-query";

// Define our global breakpoints (matching globals.css)
export const BREAKPOINTS = {
  mobileMax: "767px",
  tabletMin: "768px",
  tabletMax: "1023px",
  laptopMin: "1024px",
  laptopMax: "1439px",
  desktopMin: "1440px",
};

/**
 * A hook that returns boolean flags for current active breakpoints.
 * Safe for SSR (returns false for all during SSR).
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.mobileMax})`);
  const isTablet = useMediaQuery(`(min-width: ${BREAKPOINTS.tabletMin}) and (max-width: ${BREAKPOINTS.tabletMax})`);
  const isLaptop = useMediaQuery(`(min-width: ${BREAKPOINTS.laptopMin}) and (max-width: ${BREAKPOINTS.laptopMax})`);
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.desktopMin})`);

  // We can also provide "at least" queries which are often more useful
  const isTabletOrLarger = useMediaQuery(`(min-width: ${BREAKPOINTS.tabletMin})`);
  const isLaptopOrLarger = useMediaQuery(`(min-width: ${BREAKPOINTS.laptopMin})`);

  return {
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isTabletOrLarger,
    isLaptopOrLarger,
  };
}

export type DeviceType = "mobile" | "tablet" | "laptop" | "desktop" | "unknown";

/**
 * A hook that returns the current device type as a string based on breakpoints.
 * Returns "unknown" during SSR to avoid hydration mismatches.
 */
export function useDeviceType(): DeviceType {
  const { isMobile, isTablet, isLaptop, isDesktop } = useBreakpoints();

  // If none match (which happens during SSR before mounted), return unknown
  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  if (isLaptop) return "laptop";
  if (isDesktop) return "desktop";
  
  return "unknown";
}
