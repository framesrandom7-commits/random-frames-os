"use client";

import React from "react";
import { Search } from "lucide-react";
import { useCommand } from "@/components/providers/command-provider";

export default function SearchWidget() {
  const { toggle } = useCommand();

  return (
    <button
      onClick={toggle}
      className="w-full group flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white shadow-sm rounded-xl px-4 py-3 transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-zinc-500 group-hover:text-zinc-400 transition-colors" />
        <span className="text-sm font-medium">Search leads, clients, projects or run a command...</span>
      </div>
      <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-white/10 bg-white/5 px-2 font-mono text-[10px] font-medium text-zinc-400 group-hover:bg-white/10 group-hover:text-zinc-300 transition-colors">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
