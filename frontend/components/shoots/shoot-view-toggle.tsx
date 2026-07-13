"use client";

import React, { useTransition } from "react";
import { List, Calendar } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ShootViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const view = searchParams.get("view") || "list";

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
        onClick={() => setView("list")} 
        disabled={isPending}
        className={`h-7 px-2 ${view === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
      >
        <List className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setView("calendar")} 
        disabled={isPending}
        className={`h-7 px-2 ${view === 'calendar' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
      >
        <Calendar className="w-4 h-4" />
      </Button>
    </div>
  );
}
