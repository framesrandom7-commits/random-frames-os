import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModuleLayoutProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ModuleLayout({ className, children, ...props }: ModuleLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 w-full h-full min-h-0 bg-background relative",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface ModuleContentProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "default" | "full" | "none";
}

export function ModuleContent({ className, children, maxWidth = "default", ...props }: ModuleContentProps) {
  return (
    <div
      className={cn(
        "flex-1 w-full h-full p-4 md:p-6 lg:p-8 overflow-y-auto overflow-x-hidden focus-visible:outline-none",
        className
      )}
      tabIndex={-1}
      {...props}
    >
      <div 
        className={cn(
          "w-full flex flex-col gap-6",
          maxWidth === "default" && "max-w-7xl mx-auto",
          maxWidth === "full" && "max-w-full"
        )}
      >
        {children}
      </div>
    </div>
  )
}
