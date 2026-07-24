import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveFormGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ResponsiveFormGrid({ className, children, ...props }: ResponsiveFormGridProps) {
  return (
    <div 
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}
