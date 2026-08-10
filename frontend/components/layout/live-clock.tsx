"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client to avoid hydration mismatch
    setTime(new Date());
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    // Return a placeholder with the same width to avoid layout shift
    return <div className="h-10 w-24 flex items-center justify-center" />;
  }

  const timeString = time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="flex items-center justify-center px-4 h-10 rounded-full bg-white/5 text-white font-bold text-sm tracking-wide shadow-inner border border-white/5">
      {timeString}
    </div>
  );
}
