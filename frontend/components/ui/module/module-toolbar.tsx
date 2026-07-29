import * as React from "react";
import { cn } from "@/lib/utils";
import { ModuleFilters, ModuleFiltersProps } from "./module-filters";

export interface ModuleToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  filters?: ModuleFiltersProps["filters"];
  searchPlaceholder?: string;
}

export function ModuleToolbar({
  left,
  center,
  right,
  filters,
  searchPlaceholder,
  className,
  ...props
}: ModuleToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 md:px-6 lg:px-8 py-4 bg-transparent z-10",
        className
      )}
      {...props}
    >
      <div className="flex flex-row flex-wrap items-center gap-3 flex-1 min-w-0">
        {left ? left : (
          <ModuleFilters filters={filters} searchPlaceholder={searchPlaceholder} />
        )}
      </div>

      {center && (
        <div className="flex flex-row items-center justify-center shrink-0">
          {center}
        </div>
      )}

      {right && (
        <div className="flex flex-row flex-wrap items-center gap-3 shrink-0 sm:justify-end">
          {right}
        </div>
      )}
    </div>
  );
}
