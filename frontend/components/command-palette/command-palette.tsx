"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useCommand } from "@/components/providers/command-provider";
import { 
  Users, 
  LayoutDashboard, 
  UserCircle, 
  Briefcase, 
  Camera, 
  Calendar, 
  DollarSign, 
  BarChart 
} from "lucide-react";
import { CommandItemWrapper } from "./command-item";
import { RecentItems } from "./recent-items";

export default function CommandPalette() {
  const { isOpen, setIsOpen } = useCommand();
  const router = useRouter();

  const runCommand = (command: () => void) => {
    setIsOpen(false);
    command();
  };

  return (
    <CommandDialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
      className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 text-white sm:max-w-[600px] shadow-2xl rounded-xl"
    >
      <CommandInput placeholder="Search or run a command..." className="border-b border-white/10 text-white" />
      <CommandList className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <CommandEmpty className="py-6 text-center text-sm text-zinc-400">
          No results found.
        </CommandEmpty>

        <RecentItems onSelect={runCommand} />

        <CommandGroup heading="Quick Actions" className="text-zinc-400">
          <CommandItemWrapper
            icon={Users}
            label="New Lead"
            shortcut="L"
            onSelect={() => runCommand(() => router.push("/leads/new"))}
          />
          <CommandItemWrapper
            icon={LayoutDashboard}
            label="Dashboard"
            onSelect={() => runCommand(() => router.push("/"))}
          />
          <CommandItemWrapper
            icon={Users}
            label="Leads"
            onSelect={() => runCommand(() => router.push("/leads"))}
          />
          <CommandItemWrapper
            icon={UserCircle}
            label="Clients"
            onSelect={() => runCommand(() => router.push("/clients"))}
          />
          <CommandItemWrapper
            icon={Briefcase}
            label="Projects"
            onSelect={() => runCommand(() => router.push("/projects"))}
          />
          <CommandItemWrapper
            icon={Camera}
            label="Shoots"
            onSelect={() => runCommand(() => router.push("/shoots"))}
          />
          <CommandItemWrapper
            icon={Calendar}
            label="Calendar"
            onSelect={() => runCommand(() => router.push("/calendar"))}
          />
          <CommandItemWrapper
            icon={DollarSign}
            label="Finance"
            onSelect={() => runCommand(() => router.push("/finance"))}
          />
          <CommandItemWrapper
            icon={BarChart}
            label="Reports"
            onSelect={() => runCommand(() => router.push("/reports"))}
          />
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
