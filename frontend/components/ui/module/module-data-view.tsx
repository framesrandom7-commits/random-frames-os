import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ModuleLoadingState, ModuleEmptyState, ModuleErrorState } from "./module-states";
import { ModulePagination, ModulePaginationProps } from "./module-pagination";
import { Checkbox } from "@/components/ui/form/checkbox";

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface ModuleDataViewProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  data: T[];
  columns: ColumnDef<T>[];
  cardRender: (row: T) => React.ReactNode;
  
  // States
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  
  // State overrides
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: React.ReactNode;

  // Selection
  selectedIds?: string[];
  onSelectChange?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean) => void;
  getRowId?: (row: T) => string;

  // Pagination
  pagination?: Omit<ModulePaginationProps, "className">;
}

export function ModuleDataView<T>({
  data,
  columns,
  cardRender,
  isLoading,
  isError,
  isEmpty,
  emptyState,
  loadingState,
  errorState,
  selectedIds = [],
  onSelectChange,
  onSelectAll,
  getRowId,
  pagination,
  className,
  ...props
}: ModuleDataViewProps<T>) {
  
  if (isLoading) {
    return <>{loadingState || <ModuleLoadingState />}</>;
  }

  if (isError) {
    return <>{errorState || <ModuleErrorState />}</>;
  }

  if (isEmpty || !data || data.length === 0) {
    return <>{emptyState || <ModuleEmptyState />}</>;
  }

  const hasSelection = !!onSelectChange && !!getRowId;
  const isAllSelected = hasSelection && data.length > 0 && selectedIds.length === data.length;
  const isSomeSelected = hasSelection && selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className={cn("flex flex-col w-full", className)} {...props}>
      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-white/10 bg-background/50 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {hasSelection && (
                <TableHead className="w-12 px-4">
                  <Checkbox 
                    checked={isAllSelected}
                    ref={ref => { if (ref) { (ref as any).indeterminate = isSomeSelected } }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => {
              const rowId = getRowId ? getRowId(row) : String(rowIndex);
              const isSelected = selectedIds.includes(rowId);

              return (
                <TableRow key={rowId} data-state={isSelected ? "selected" : undefined}>
                  {hasSelection && (
                    <TableCell className="px-4">
                      <Checkbox 
                        checked={isSelected}
                        onChange={(e) => onSelectChange?.(rowId, e.target.checked)}
                        aria-label={`Select row ${rowId}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} className={col.className}>
                      {col.cell ? col.cell(row) : (col.accessorKey ? String((row as any)[col.accessorKey]) : null)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="flex flex-col gap-4 md:hidden">
        {hasSelection && (
          <div className="flex items-center gap-2 px-2 pb-2 border-b border-white/10">
            <Checkbox 
              checked={isAllSelected}
              ref={ref => { if (ref) { (ref as any).indeterminate = isSomeSelected } }}
              onChange={(e) => onSelectAll?.(e.target.checked)}
              id="select-all-mobile"
            />
            <label htmlFor="select-all-mobile" className="text-sm text-zinc-400">
              Select All
            </label>
          </div>
        )}
        
        {data.map((row, rowIndex) => {
          const rowId = getRowId ? getRowId(row) : String(rowIndex);
          const isSelected = selectedIds.includes(rowId);
          
          return (
            <div key={rowId} className="relative group">
              {hasSelection && (
                <div className="absolute top-4 right-4 z-10">
                  <Checkbox 
                    checked={isSelected}
                    onChange={(e) => onSelectChange?.(rowId, e.target.checked)}
                  />
                </div>
              )}
              {cardRender(row)}
            </div>
          );
        })}
      </div>

      {pagination && (
        <ModulePagination {...pagination} className="mt-4" />
      )}
    </div>
  );
}
