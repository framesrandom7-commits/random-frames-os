"use client";

import React from "react";
import { CommandItem, CommandShortcut } from "@/components/ui/command";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItemWrapperProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export function CommandItemWrapper({
  icon: Icon,
  label,
  shortcut,
  onSelect,
  disabled = false,
}: CommandItemWrapperProps) {
  return (
    <CommandItem
      onSelect={onSelect}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 cursor-pointer transition-colors duration-200 group rounded-md",
        "data-[selected=true]:bg-[#C1121F]/10 data-[selected=true]:text-[#C1121F]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className={cn(
        "w-4 h-4 text-zinc-400 group-data-[selected=true]:text-[#C1121F]"
      )} />
      <span className="flex-1 font-medium">{label}</span>
      {shortcut && (
        <CommandShortcut className="group-data-[selected=true]:text-[#C1121F]/70">
          {shortcut}
        </CommandShortcut>
      )}
    </CommandItem>
  );
}
