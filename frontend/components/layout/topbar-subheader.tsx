"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TopBarSubheaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function TopBarSubheader({ children, className, ...props }: TopBarSubheaderProps) {
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setPortalTarget(document.getElementById("topbar-subheader-portal"));
  }, []);

  const content = (
    <div className={cn("flex flex-col gap-4 px-6 lg:px-8 pb-4 pt-0 w-full", className)} {...props}>
      {children}
    </div>
  );

  if (mounted && portalTarget) {
    return createPortal(content, portalTarget);
  }

  return null;
}
