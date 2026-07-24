"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Typography } from "@/components/ui/typography";

export interface ModulePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalCount: number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
}

export function ModulePagination({
  totalCount,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  className,
  ...props
}: ModulePaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || defaultPageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const createQueryString = React.useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        params.set(key, String(value));
      });
      return params.toString();
    },
    [searchParams]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    router.push(pathname + "?" + createQueryString({ page: newPage }));
  };

  const handleSizeChange = (newSize: string | null) => {
    if (!newSize) return;
    router.push(pathname + "?" + createQueryString({ size: newSize, page: 1 }));
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-white/10",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Typography variant="body" color="muted">
          Showing <span className="font-medium text-foreground">{totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
          <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span> results
        </Typography>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 hidden sm:flex">
          <Typography variant="body" color="muted" className="text-xs">Rows per page</Typography>
          <Select value={String(pageSize)} onValueChange={handleSizeChange}>
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
            title="First page"
          >
            <ChevronsLeft className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <ChevronLeft className="size-3" />
          </Button>
          
          <div className="flex items-center justify-center text-xs font-medium w-16 text-center">
            Page {currentPage} of {totalPages}
          </div>

          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next page"
          >
            <ChevronRight className="size-3" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last page"
          >
            <ChevronsRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
