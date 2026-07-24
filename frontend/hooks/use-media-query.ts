"use client";

import { useEffect, useState } from "react";

/**
 * A custom hook that evaluates a CSS media query and returns its boolean result.
 * It is SSR-safe by returning a default value (false) until the component mounts.
 * 
 * @param query The media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    // Check if window is defined (browser environment)
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia(query);
      
      // Set initial value
      setMatches(mediaQuery.matches);
      
      // Define callback for changes
      const handleChange = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };
      
      // Add listener
      // Modern browsers support addEventListener, older ones use addListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else {
        mediaQuery.addListener(handleChange);
      }
      
      // Cleanup listener on unmount
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [query]);

  // Return false during SSR to avoid hydration mismatches
  if (!mounted) return false;

  return matches;
}
