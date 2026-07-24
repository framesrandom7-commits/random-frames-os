import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export interface ModuleBulkActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedCount: number;
  onClearSelection: () => void;
  actions?: React.ReactNode;
}

export function ModuleBulkActions({
  selectedCount,
  onClearSelection,
  actions,
  className,
  ...props
}: ModuleBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-row items-center gap-4 px-4 py-3 rounded-full bg-zinc-900 border border-white/10 shadow-xl shadow-black/50 backdrop-blur-md animate-in slide-in-from-bottom-10 fade-in-0 duration-300",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 px-2 border-r border-white/10 pr-4">
        <CheckSquare className="size-4 text-emerald-500" />
        <Typography variant="body" className="font-medium text-white whitespace-nowrap">
          {selectedCount} selected
        </Typography>
      </div>
      
      <div className="flex items-center gap-2">
        {actions}
      </div>

      <div className="pl-2 ml-2 border-l border-white/10">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClearSelection}
          className="text-zinc-400 hover:text-white rounded-full"
          title="Clear selection"
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
