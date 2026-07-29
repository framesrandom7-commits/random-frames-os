"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutList, KanbanSquare, Calendar, LayoutGrid, Clock, List } from "lucide-react";

export type ViewType = "list" | "kanban" | "cards" | "calendar" | "timeline" | "gallery";

export interface ViewSwitcherConfig {
  id: ViewType;
  label: string;
  icon?: React.ReactNode;
}

const DEFAULT_ICONS: Record<ViewType, React.ReactNode> = {
  list: <List className="w-4 h-4" />,
  cards: <LayoutList className="w-4 h-4" />,
  kanban: <KanbanSquare className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  timeline: <Clock className="w-4 h-4" />,
  gallery: <LayoutGrid className="w-4 h-4" />
};

export interface ModuleViewSwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  views: ViewSwitcherConfig[];
  defaultView?: ViewType;
}

export function ModuleViewSwitcher({
  views,
  defaultView,
  className,
  ...props
}: ModuleViewSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeView = (searchParams.get("view") as ViewType) || defaultView || views[0]?.id;

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!views || views.length <= 1) return null;

  return (
    <div className={cn("flex justify-between items-center bg-white/5 p-1 rounded-lg w-fit border border-white/10 mb-4", className)} {...props}>
      <Tabs value={activeView} onValueChange={handleViewChange} className="w-full">
        <TabsList className="bg-transparent text-zinc-400 h-9 p-0 border-none">
          {views.map((view) => (
            <TabsTrigger 
              key={view.id} 
              value={view.id} 
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white h-full px-3 flex items-center gap-2"
            >
              {view.icon || DEFAULT_ICONS[view.id]}
              <span className="hidden sm:inline">{view.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
