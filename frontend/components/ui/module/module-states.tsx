import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, FileSearch, FilterX, Inbox } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export interface ModuleStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function ModuleState({
  title,
  description,
  icon,
  action,
  className,
  ...props
}: ModuleStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] w-full p-8 text-center",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted-foreground">
          {icon}
        </div>
      )}
      {title && (
        <Typography variant="sectionTitle" className="mb-2">
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body" color="muted" className="max-w-md mb-6">
          {description}
        </Typography>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export function ModuleEmptyState({
  title = "No data available",
  description = "Get started by creating a new record.",
  action,
  className,
  ...props
}: Omit<ModuleStateProps, "icon">) {
  return (
    <ModuleState
      title={title}
      description={description}
      icon={<Inbox className="size-8" />}
      action={action}
      className={className}
      {...props}
    />
  );
}

export function ModuleLoadingState({
  title = "Loading...",
  description = "Please wait while we fetch the data.",
  className,
  ...props
}: Omit<ModuleStateProps, "icon" | "action">) {
  return (
    <ModuleState
      title={title}
      description={description}
      icon={<Loader2 className="size-8 animate-spin" />}
      className={className}
      {...props}
    />
  );
}

export function ModuleErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this data. Please try again.",
  onRetry,
  className,
  ...props
}: Omit<ModuleStateProps, "icon" | "action"> & { onRetry?: () => void }) {
  return (
    <ModuleState
      title={title}
      description={description}
      icon={<AlertCircle className="size-8 text-destructive" />}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )
      }
      className={className}
      {...props}
    />
  );
}

export function ModuleNoSearchResultsState({
  title = "No results found",
  description = "We couldn't find anything matching your search. Try adjusting your keywords.",
  onClear,
  className,
  ...props
}: Omit<ModuleStateProps, "icon" | "action"> & { onClear?: () => void }) {
  return (
    <ModuleState
      title={title}
      description={description}
      icon={<FileSearch className="size-8" />}
      action={
        onClear && (
          <Button variant="outline" onClick={onClear}>
            Clear Search
          </Button>
        )
      }
      className={className}
      {...props}
    />
  );
}

export function ModuleNoFilterResultsState({
  title = "No matches for filters",
  description = "Try changing or removing some of your active filters to see more results.",
  onClear,
  className,
  ...props
}: Omit<ModuleStateProps, "icon" | "action"> & { onClear?: () => void }) {
  return (
    <ModuleState
      title={title}
      description={description}
      icon={<FilterX className="size-8" />}
      action={
        onClear && (
          <Button variant="outline" onClick={onClear}>
            Clear Filters
          </Button>
        )
      }
      className={className}
      {...props}
    />
  );
}
