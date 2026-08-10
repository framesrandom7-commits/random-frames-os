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
  getRowId?: (row: T) => string;
  onSelectionChange?: (selectedIds: string[]) => void;
  bulkActions?: (selectedIds: string[], onClearSelection: () => void) => React.ReactNode;

  // Pagination
  pagination?: Omit<ModulePaginationProps, "className">;

  // Interactions
  onRowClick?: (row: T) => void;
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
  getRowId,
  onSelectionChange,
  bulkActions,
  pagination,
  onRowClick,
  className,
  ...props
}: ModuleDataViewProps<T>) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Notify parent of selection changes if needed
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedIds);
    }
  }, [selectedIds, onSelectionChange]);

  const handleSelectAll = (checked: boolean) => {
    if (!getRowId) return;
    if (checked) {
      setSelectedIds(data.map(getRowId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectChange = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(i => i !== id)
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };
  
  if (isLoading) {
    return <>{loadingState || <ModuleLoadingState />}</>;
  }

  if (isError) {
    return <>{errorState || <ModuleErrorState />}</>;
  }

  if (isEmpty || !data || data.length === 0) {
    return <>{emptyState || <ModuleEmptyState />}</>;
  }

  const hasSelection = !!getRowId && !!bulkActions;
  const isAllSelected = hasSelection && data.length > 0 && selectedIds.length === data.length;
  const isSomeSelected = hasSelection && selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className={cn("flex flex-col w-full", className)} {...props}>
      {hasSelection && selectedIds.length > 0 && bulkActions && (
        bulkActions(selectedIds, clearSelection)
      )}
      {/* Desktop / Tablet Table View */}
      <div className="hidden md:block w-full overflow-x-auto rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {hasSelection && (
                <TableHead className="w-12 px-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C1121F] focus:ring-[#C1121F]"
                    checked={isAllSelected}
                    ref={ref => { if (ref) { (ref as any).indeterminate = isSomeSelected } }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
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
                <TableRow 
                  key={rowId} 
                  data-state={isSelected ? "selected" : undefined}
                  onClick={() => onRowClick?.(row)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-white/5")}
                >
                  {hasSelection && (
                    <TableCell className="px-4">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C1121F] focus:ring-[#C1121F]"
                        checked={isSelected}
                        onChange={(e) => handleSelectChange(rowId, e.target.checked)}
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
              <input 
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C1121F] focus:ring-[#C1121F]"
                checked={isAllSelected}
                ref={ref => { if (ref) { (ref as any).indeterminate = isSomeSelected } }}
                onChange={(e) => handleSelectAll(e.target.checked)}
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
                <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C1121F] focus:ring-[#C1121F]"
                  checked={isSelected}
                  onChange={(e) => handleSelectChange(rowId, e.target.checked)}
                  id={`card-checkbox-${rowId}`}
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
