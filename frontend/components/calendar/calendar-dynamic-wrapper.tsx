"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the FullCalendarWrapper to disable SSR
// FullCalendar is known to cause class constructor errors with Next.js SSR
const FullCalendarWrapper = dynamic(
  () => import("./full-calendar-wrapper"),
  { 
    ssr: false, 
    loading: () => <div className="flex items-center justify-center h-full text-zinc-500">Loading Calendar...</div> 
  }
);

export default function CalendarDynamicWrapper(props: any) {
  return <FullCalendarWrapper {...props} />;
}
