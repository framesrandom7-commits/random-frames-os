"use client";

import React, { useTransition } from "react";
import { LayoutGrid, List } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProjectViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const view = searchParams.get("view") || "grid";

  const setView = (newView: string) => {
    if (view === newView) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", newView);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setView("grid")} 
        disabled={isPending}
        className={`h-7 px-2 ${view === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setView("table")} 
        disabled={isPending}
        className={`h-7 px-2 ${view === 'table' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}
