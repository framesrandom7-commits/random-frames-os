"use client";

import React from "react";
import { Search } from "lucide-react";
import { useCommand } from "@/components/providers/command-provider";

export default function SearchWidget() {
  const { toggle } = useCommand();

  return (
    <button
      onClick={toggle}
      className="w-full group flex items-center justify-between bg-[#1D212B]/80 hover:bg-[#1D212B] border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white shadow-lg rounded-full px-5 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#E53935]/50 focus:border-[#E53935]/50"
    >
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
        <span className="text-sm font-medium">Search leads, clients, projects or run a command...</span>
      </div>
      <kbd className="hidden sm:inline-flex h-7 items-center gap-1 rounded-full border border-white/10 bg-[#0F1115] px-2.5 font-mono text-[10px] font-medium text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
