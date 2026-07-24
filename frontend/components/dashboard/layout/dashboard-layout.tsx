import * as React from "react"
import { cn } from "@/lib/utils"

export interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DashboardLayout({ children, className, ...props }: DashboardLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {children}
    </div>
  )
}

export interface DashboardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function DashboardContent({ children, className, ...props }: DashboardContentProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {children}
    </div>
  )
}
