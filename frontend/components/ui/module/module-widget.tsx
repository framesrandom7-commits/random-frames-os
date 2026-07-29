"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/feedback/skeleton"
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

export interface ModuleWidgetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  
  // States
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: React.ReactNode;
  error?: boolean;
  errorMessage?: React.ReactNode;
  
  // Future capabilities
  onRefresh?: () => void;
  collapsible?: boolean;
  
  // Layout
  contentClassName?: string;
}

export function ModuleWidget({
  title,
  subtitle,
  actions,
  footer,
  loading,
  empty,
  emptyMessage = "No data available",
  error,
  errorMessage = "Failed to load data",
  onRefresh,
  collapsible,
  className,
  contentClassName,
  children,
  ...props
}: ModuleWidgetProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <Card className={cn("flex flex-col", className)} {...props}>
      {(title || subtitle || actions || collapsible || onRefresh) && (
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex flex-col space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={loading}
                className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors rounded"
                aria-label="Refresh widget"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            )}
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                aria-label={isCollapsed ? "Expand widget" : "Collapse widget"}
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            )}
          </div>
        </CardHeader>
      )}
      
      {!isCollapsed && (
        <>
          <CardContent className={cn("flex-1", contentClassName)}>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-destructive/80">
                <AlertCircle className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            ) : empty ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">{emptyMessage}</p>
              </div>
            ) : (
              children
            )}
          </CardContent>
          
          {footer && (
            <CardFooter className="pt-4 border-t border-white/5">
              {footer}
            </CardFooter>
          )}
        </>
      )}
    </Card>
  )
}
