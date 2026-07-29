import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModuleDetailsLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleDetailsLayout({ children, className, ...props }: ModuleDetailsLayoutProps) {
  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-7xl mx-auto", className)} {...props}>
      {children}
    </div>
  )
}

export interface ModuleDetailsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleDetailsHeader({ children, className, ...props }: ModuleDetailsHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-4 border-b border-white/10", className)} {...props}>
      {children}
    </div>
  )
}

export interface ModuleDetailsBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleDetailsBody({ children, className, ...props }: ModuleDetailsBodyProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)} {...props}>
      {children}
    </div>
  )
}

export interface ModuleDetailsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleDetailsContent({ children, className, ...props }: ModuleDetailsContentProps) {
  return (
    <div className={cn("flex flex-col gap-6 lg:col-span-2", className)} {...props}>
      {children}
    </div>
  )
}

export interface ModuleDetailsSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleDetailsSidebar({ children, className, ...props }: ModuleDetailsSidebarProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {children}
    </div>
  )
}

export interface ModuleDetailsSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModuleDetailsSection({ children, className, ...props }: ModuleDetailsSectionProps) {
  return (
    <div className={cn("bg-white/5 border border-white/10 rounded-xl p-6", className)} {...props}>
      {children}
    </div>
  )
}
