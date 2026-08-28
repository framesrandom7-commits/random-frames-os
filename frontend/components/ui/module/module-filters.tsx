"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// Depending on design, these could use DropdownMenu or Popover for multi-selects and complex filters.

export type FilterType = "text" | "select" | "multi-select" | "date" | "status";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface ModuleFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
  filters?: FilterDef[];
  searchPlaceholder?: string;
}

export function ModuleFilters({
  filters = [],
  searchPlaceholder = "Search...",
  className,
  ...props
}: ModuleFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams to manipulate query params easily
  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Always reset page to 1 when filters change
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    router.push(pathname + "?" + createQueryString("q", term));
  };

  const handleFilterChange = (filterId: string, value: string) => {
    // For select filters, value could be 'all' which means clear the filter
    if (value === "all") {
      router.push(pathname + "?" + createQueryString(filterId, ""));
    } else {
      router.push(pathname + "?" + createQueryString(filterId, value));
    }
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  const activeFiltersCount = Array.from(searchParams.keys()).filter(key => key !== 'page' && key !== 'size').length;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)} {...props}>
      <div className="relative min-w-[200px] max-w-sm flex-1 md:flex-none">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          className="pl-9 h-9"
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => {
            // Debounce would be ideal here in a real implementation
            handleSearch(e);
          }}
        />
      </div>

      {filters.map((filter) => {
        if (filter.type === "select" || filter.type === "status") {
          return (
              <Select
              key={filter.id}
              value={searchParams.get(filter.id)?.toString() || ""}
              onValueChange={(val: string | null) => handleFilterChange(filter.id, val || "")}
            >
              <SelectTrigger className="w-[160px] h-9 bg-white/5 backdrop-blur-sm border-white/10">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return null;
      })}

      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 px-2 text-muted-foreground hover:text-foreground">
          Clear Filters
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
